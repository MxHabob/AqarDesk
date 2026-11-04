"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/card"
import { Button } from "@aqardesk/ui/button"
import { Input } from "@aqardesk/ui/input"
import { useUserQuery } from "@/hooks/use-user"
import { useI18n } from "@/locales/client"

export function ChangeEmail() {
  const t = useI18n()
  const { data: user } = useUserQuery()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case tracking-normal">
          {t("accountSettings.emailTitle")}
        </CardTitle>
        <CardDescription>
          {t("accountSettings.emailDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          id="account-email"
          className="max-w-[300px]"
          value={user?.email ?? ""}
          readOnly
          dir="ltr"
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>{t("accountSettings.emailFooter")}</div>
        <Button type="button" disabled>
          {t("accountSettings.save")}
        </Button>
      </CardFooter>
    </Card>
  )
}
