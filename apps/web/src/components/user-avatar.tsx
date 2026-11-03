"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/card";
import { useI18n } from "@/locales/client";
import { useUserQuery } from "@/hooks/use-user";
import { AvatarUpload } from "./avatar-upload";

export function UserAvatar() {
  const t = useI18n();
  const { data: user } = useUserQuery();

  return (
    <Card>
      <div className="flex items-center justify-between gap-6 pe-6">
        <CardHeader className="min-w-0 flex-1">
          <CardTitle className="normal-case tracking-normal">
            {t("userAvatar.title")}
          </CardTitle>
          <CardDescription>{t("userAvatar.description")}</CardDescription>
        </CardHeader>
        {user && <AvatarUpload userId={user.id} avatarUrl={user.avatarUrl} />}
      </div>
      <CardFooter>{t("userAvatar.footer")}</CardFooter>
    </Card>
  );
}
