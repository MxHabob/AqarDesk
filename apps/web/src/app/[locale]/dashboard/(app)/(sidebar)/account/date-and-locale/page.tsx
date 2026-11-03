import type { Metadata } from "next"
import { ChangeTimezone } from "@/components/change-timezone"
import { DateFormatSettings } from "@/components/date-format-settings"
import { LocaleSettings } from "@/components/locale-settings"
import { TimeFormatSettings } from "@/components/time-format-settings"
import { WeekSettings } from "@/components/week-settings"
import { getQueryClient, HydrateClient } from "@/queries/server"
import { userSettingsQueryOptions } from "@/queries/user-settings"

export const metadata: Metadata = {
  title: "Date & Locale | AqarDesk",
}

export default async function Page() {
  await getQueryClient().prefetchQuery(userSettingsQueryOptions())
  return (
    <HydrateClient>
      <div className="space-y-12">
        <LocaleSettings />
        <ChangeTimezone />
        <TimeFormatSettings />
        <DateFormatSettings />
        <WeekSettings />
      </div>
    </HydrateClient>
  )
}
