"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/card";
import { useUserQuery } from "@/hooks/use-user";
import { AvatarUpload } from "./avatar-upload";

export function UserAvatar() {
  const { data: user } = useUserQuery();

  return (
    <Card>
      <div className="flex items-center justify-between gap-6 pe-6">
        <CardHeader className="min-w-0 flex-1">
          <CardTitle className="normal-case tracking-normal">Avatar</CardTitle>
          <CardDescription dir="auto">
            This is your avatar. Click on the avatar to upload a custom one from
            your files.
          </CardDescription>
        </CardHeader>
        {user && <AvatarUpload userId={user.id} avatarUrl={user.avatarUrl} />}
      </div>
      <CardFooter dir="auto">
        An avatar is optional but strongly recommended.
      </CardFooter>
    </Card>
  );
}
