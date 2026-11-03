"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/card";
import { Switch } from "@aqardesk/ui/switch";
import { useUserMutation, useUserQuery } from "@/hooks/use-user";
import { useI18n } from "@/locales/client";

export function WeekSettings() {
  const t = useI18n();
  const { data: user } = useUserQuery();
  const updateUserMutation = useUserMutation();

  return (
    <Card className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
      <CardHeader className="min-w-0 w-full sm:flex-1">
        <CardTitle className="normal-case tracking-normal">
          {t("accountSettings.weekStartTitle")}
        </CardTitle>
        <CardDescription>
          {t("accountSettings.weekStartDescription")}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex w-full justify-end sm:w-auto">
        <Switch
          checked={user?.weekStartsOnMonday ?? false}
          disabled={updateUserMutation.isPending}
          onCheckedChange={(weekStartsOnMonday: boolean) => {
            updateUserMutation.mutate({ weekStartsOnMonday });
          }}
        />
      </CardContent>
    </Card>
  );
}
