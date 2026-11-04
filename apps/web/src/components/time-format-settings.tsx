"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aqardesk/ui/select"
import { useUserMutation, useUserQuery } from "@/hooks/use-user"
import { useI18n } from "@/locales/client"

export function TimeFormatSettings() {
  const t = useI18n()
  const updateUserMutation = useUserMutation()
  const { data: user } = useUserQuery()

  return (
    <Card className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
      <CardHeader className="min-w-0 w-full sm:flex-1">
        <CardTitle className="normal-case tracking-normal">
          {t("accountSettings.timeFormatTitle")}
        </CardTitle>
        <CardDescription>
          {t("accountSettings.timeFormatDescription")}
        </CardDescription>
      </CardHeader>

      <CardContent className="w-full sm:w-auto">
        <Select
          value={user?.timeFormat?.toString() ?? undefined}
          onValueChange={(value) => {
            if (!value) return
            updateUserMutation.mutate({ timeFormat: +value })
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue
              placeholder={t("accountSettings.timeFormatPlaceholder")}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">
              {t("accountSettings.twelveHours")}
            </SelectItem>
            <SelectItem value="24">
              {t("accountSettings.twentyFourHours")}
            </SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
