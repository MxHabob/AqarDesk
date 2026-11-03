"use client"

import { SecondaryMenu } from "@/components/secondary-menu"
import { useI18n } from "@/locales/client"

export function AccountSecondaryMenu() {
  const t = useI18n()

  return (
    <SecondaryMenu
      items={[
        {
          path: "/dashboard/account",
          label: t("accountSettings.general"),
        },
        {
          path: "/dashboard/account/date-and-locale",
          label: t("accountSettings.dateAndLocale"),
        },
        {
          path: "/dashboard/account/security",
          label: t("accountSettings.security"),
        },
        {
          path: "/dashboard/teams",
          label: t("accountSettings.teams"),
        },
        {
          path: "/dashboard/account/support",
          label: t("accountSettings.support"),
        },
      ]}
    />
  )
}
