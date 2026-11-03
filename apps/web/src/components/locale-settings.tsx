"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/card"
import { ComboboxDropdown } from "@aqardesk/ui/combobox-dropdown"
import { useUserMutation, useUserQuery } from "@/hooks/use-user"
import { useI18n } from "@/locales/client"
import { locales } from "@/locales/config"

export function LocaleSettings() {
  const t = useI18n()
  const { data: user } = useUserQuery()
  const updateUserMutation = useUserMutation()

  const localeItems = locales.map((locale) => ({
    id: locale,
    label: locale === "ar" ? "العربية (ar)" : "English (en)",
    value: locale,
  }))

  return (
    <Card className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
      <CardHeader className="min-w-0 w-full sm:flex-1">
        <CardTitle className="normal-case tracking-normal">
          {t("locale.title")}
        </CardTitle>
        <CardDescription>{t("locale.description")}</CardDescription>
      </CardHeader>

      <CardContent className="w-full sm:w-auto">
        <div className="w-full sm:w-[250px]">
          <ComboboxDropdown
            placeholder={t("locale.placeholder")}
            selectedItem={localeItems.find(
              (item) => item.value === user?.locale
            )}
            searchPlaceholder={t("locale.searchPlaceholder")}
            items={localeItems}
            className="text-xs py-1"
            onSelect={(item) => {
              updateUserMutation.mutate({ locale: item.value })
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
