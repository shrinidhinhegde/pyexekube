import {FormProvider} from "react-hook-form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import UIAvatar from "@/components/sidenav/UIAvatar";
import {FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useProfileForm, UserWithId} from "./profileFormHandler";
import {Session} from "next-auth";

type ProfileFormProps = {
  user: UserWithId;
  onUpdate: (data?: Partial<UserWithId>) => Promise<Session | null>;
};

export function ProfileForm({user, onUpdate}: ProfileFormProps) {
  const {
    form,
    avatarPreview,
    setAvatarPreview,
    watchedAvatar,
    handleAvatarChange,
    onProfileSubmit,
  } = useProfileForm(user, onUpdate);

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onProfileSubmit)}
        className="w-full mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden"
      >
        <div className="flex flex-col items-center gap-4 p-6 bg-zinc-50 dark:bg-zinc-800 justify-center">
          <UIAvatar
            className="w-20 h-20 border-2 border-[var(--color-chateau-green-600)]"
            src={avatarPreview || undefined}
            fallback={user?.name || "User"}
          />
          <input
            type="file"
            accept="image/*"
            id="avatar-upload"
            className="hidden"
            {...form.register("avatar")}
            onChange={handleAvatarChange}
            disabled={form.formState.isSubmitting}
          />
          <Button
            type="button"
            onClick={() => document.getElementById("avatar-upload")?.click()}
            disabled={form.formState.isSubmitting}
            variant="outline"
            className="w-full"
          >
            Change Avatar
          </Button>
          {watchedAvatar instanceof File && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                form.setValue("avatar", undefined);
                setAvatarPreview(user?.image || null);
              }}
              disabled={form.formState.isSubmitting}
              className="w-full"
            >
              Delete
            </Button>
          )}
          {form.formState.errors.avatar && (
            <div className="text-xs text-red-600">{form.formState.errors.avatar.message as string}</div>
          )}
        </div>

        <div className="hidden md:block w-px bg-zinc-200 dark:bg-zinc-700"/>

        <div className="flex-1 p-6 flex flex-col gap-6">
          <h2 className="text-lg font-semibold mb-2">
            Profile Details
          </h2>
          <FormField
            control={form.control}
            name="name"
            render={({field}) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <Input
                  {...field}
                  disabled={form.formState.isSubmitting}
                  className="max-w-md"
                />
                <FormMessage/>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="self-start max-w-xs"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Update Profile"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}