"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/card"
import { Label } from "@aqardesk/ui/label"
import { Switch } from "@aqardesk/ui/switch"
import { useUserMutation, useUserQuery } from "@/hooks/use-user"
import { useScopedI18n } from "@/locales/client"

export function ListingEmailNotifications() {
  const t = useScopedI18n("emailNotifications")
  const { data: user } = useUserQuery()
  const updateUser = useUserMutation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label htmlFor="listing-email-notifications">
            {t("listingUpdates")}
          </Label>
          {!user?.emailVerified && (
            <p className="text-sm text-muted-foreground">
              {t("verifyEmailToSubscribe")}
            </p>
          )}
        </div>
        <Switch
          id="listing-email-notifications"
          checked={user?.listingEmailNotifications ?? false}
          disabled={!user?.emailVerified || updateUser.isPending}
          onCheckedChange={(checked) =>
            updateUser.mutate({ listingEmailNotifications: checked })
          }
        />
      </CardContent>
    </Card>
  )
}
