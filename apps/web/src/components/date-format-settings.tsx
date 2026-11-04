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

export function DateFormatSettings() {
  const t = useI18n()
  const { data: user } = useUserQuery()
  const updateUserMutation = useUserMutation()

  return (
    <Card className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
      <CardHeader className="min-w-0 w-full sm:flex-1">
        <CardTitle className="normal-case tracking-normal">
          {t("accountSettings.dateFormatTitle")}
        </CardTitle>
        <CardDescription>
          {t("accountSettings.dateFormatDescription")}
        </CardDescription>
      </CardHeader>

      <CardContent className="w-full sm:w-auto">
        <Select
          value={user?.dateFormat ?? undefined}
          onValueChange={(value) => {
            updateUserMutation.mutate({
              dateFormat: value as
                | "dd/MM/yyyy"
                | "MM/dd/yyyy"
                | "yyyy-MM-dd"
                | "dd.MM.yyyy",
            })
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue
              placeholder={t("accountSettings.dateFormatPlaceholder")}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
            <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
            <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
            <SelectItem value="dd.MM.yyyy">dd.MM.yyyy</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
