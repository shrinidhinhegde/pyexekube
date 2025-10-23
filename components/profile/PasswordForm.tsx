import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {usePasswordForm} from "./passwordFormHandler";
import {LockIcon} from "lucide-react";
import {FormProvider} from "react-hook-form";
import {FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";

export function PasswordForm() {
  const {form, onSubmit} = usePasswordForm();

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden"
      >
        <div className="flex flex-col items-center justify-center gap-2 p-6 bg-zinc-50 dark:bg-zinc-800">
          <LockIcon className="w-10 h-10 text-primary"/>
          <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Update Password
                </span>
        </div>
        <div className="hidden md:block w-px bg-zinc-200 dark:bg-zinc-700"/>
        <div className="flex-1 p-6 flex flex-col gap-6">
          <h2 className="text-lg font-semibold mb-2">
            Update Password
          </h2>
          <FormField
            control={form.control}
            name="currentPassword"
            render={({field}) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <Input
                  {...field}
                  type="password"
                  className="max-w-md"
                />
                <FormMessage/>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({field}) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <Input
                  {...field}
                  type="password"
                  className="max-w-md"
                />
                <FormMessage/>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({field}) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <Input
                  {...field}
                  type="password"
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
            Change Password
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}