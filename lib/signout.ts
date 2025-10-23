import {signOut} from "next-auth/react";

export function useAuth() {
  const handleSignOut = async () => {
    await signOut({callbackUrl: "/"});
  };

  return {handleSignOut};
}