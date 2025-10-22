import {useForm, useWatch} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Session} from "next-auth";
import {fetcher} from "@/lib/utils";
import {useState} from "react";
import {toast} from "sonner";

export const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  avatar: z
    .any()
    .optional()
    .refine(
      file =>
        file === undefined ||
        file === null ||
        (file instanceof File && file.type.startsWith("image/")) ||
        (file instanceof FileList && file.length === 0) ||
        (Array.isArray(file) && file.length === 0),
      {message: "Invalid file. Please choose an image."}
    ),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type UserWithId = Session["user"] & { id?: string | null };

export function useProfileForm(user: UserWithId, onUpdate: (data?: Partial<UserWithId>) => Promise<Session | null>) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.image || null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      avatar: undefined,
    },
    mode: "onTouched"
  });

  const watchedAvatar = useWatch({name: "avatar", control: form.control});

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    form.setValue("avatar", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(user?.image || null);
    }
  }

  async function onProfileSubmit(data: ProfileFormValues) {
    try {
      let imageUrl = user?.image;

      if (data.avatar instanceof File) {
        const file = data.avatar;
        const ext = file.name.split('.').pop();
        const publicUrl = `images/${user.id}.${ext}`;
        const presignRes = await fetcher(`/api/presigned-url`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            path: publicUrl,
            type: "image/*"
          }),
        });
        const {url} = presignRes;

        const uploadRes = await fetch(url, {
          method: "PUT",
          body: file,
          headers: {"Content-Type": "image/*"}
        });
        if (!uploadRes.ok) throw new Error("Failed to upload image");
        imageUrl = publicUrl;
      }

      await fetcher(`/api/update-cognito-user`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          image_path: imageUrl,
          name: data.name,
          sub: user.id,
        }),
      });

      await onUpdate({
        name: data.name,
        image: imageUrl
      });

      toast.success("Profile updated successfully!");
      form.setValue("avatar", undefined);
      setAvatarPreview(imageUrl || null);
    } catch (e) {
      toast.error("Failed to update profile.");
    }
  }

  return {
    form,
    avatarPreview,
    setAvatarPreview,
    watchedAvatar,
    handleAvatarChange,
    onProfileSubmit,
  };
}