import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";

export default function UserNotFoundError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <UserX className="h-12 w-12 text-destructive" />
      <h2 className="text-2xl font-semibold">User not found</h2>
      <p className="text-muted-foreground">
        We couldn't find your profile. Please sign in or try again later.
      </p>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}