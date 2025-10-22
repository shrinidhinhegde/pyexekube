"use client";
import {useSession} from "next-auth/react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent} from "@/components/ui/card";
import {ProfileForm} from "@/components/profile/profile/ProfileForm";
import {PasswordForm} from "@/components/profile/PasswordForm";
import ProfileLoading from "@/components/profile/profile/ProfileLoading";
import UserNotFoundError from "@/components/profile/profile/ProfileError";

export default function ProfilePage() {
  const {data: session, update, status} = useSession();
  const user = session?.user;

  if (status === "loading")
    return (
      <ProfileLoading/>
    );

  if (!user)
    return (
      <UserNotFoundError/>
    );

  return (
    <div className="p-8 min-h-screen">
      <div className="flex justify-between mb-4 space-x-2">
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          <span>Account Settings</span>
        </h1>
      </div>
      <Card>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="flex w-full justify-center gap-2 mb-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
              <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
              <TabsTrigger value="password" className="flex-1">Update Password</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <ProfileForm user={user} onUpdate={update}/>
            </TabsContent>
            <TabsContent value="password">
              <PasswordForm/>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}