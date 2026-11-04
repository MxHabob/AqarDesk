"use client"

import { Button } from "@aqardesk/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/card"
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
          className="w-full max-w-[300px]"
          value={user?.email ?? ""}
          readOnly
          dir="ltr"
        />
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground">
          {t("accountSettings.emailFooter")}
        </div>
        <Button className="w-full sm:w-auto" type="button" disabled>
          {t("accountSettings.save")}
        </Button>
      </CardFooter>
    </Card>
  )
}
