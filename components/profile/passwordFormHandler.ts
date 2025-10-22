import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {fetcher} from "@/lib/utils";
import {useSession} from "next-auth/react";
import {toast} from "sonner";
import {useAuth} from "@/lib/signout";

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Please enter your current password"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*()_\-+=[\]{}|;':",.<>/?]/, "Password must contain at least one symbol"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New password and confirmation do not match",
});

export type PasswordFormValues = z.infer<typeof passwordSchema>;

export function usePasswordForm() {
  const session = useSession();
  const email = session.data?.user?.email;
  const {handleSignOut} = useAuth();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onTouched"
  });

  async function onSubmit(data: PasswordFormValues) {
    try {
      await fetcher(`/api/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email ?? "",
          oldPassword: data.currentPassword,
          newPassword: data.newPassword,
        })
      });
      toast.success("Password changed successfully. Please log in again.");
      handleSignOut().then()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "An error occurred while changing your password.");
    }
    form.reset();
  }

  return {
    form,
    onSubmit,
  };
}