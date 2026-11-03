import type { Metadata } from "next"
import { Suspense } from "react"
import { AccountSettings } from "@/components/account-settings"
import { SettingsLoading } from "@/components/settings-loading"
import { getQueryClient, HydrateClient } from "@/queries/server"
import { userSettingsQueryOptions } from "@/queries/user-settings"

export const metadata: Metadata = {
  title: "Account Settings | AqarDesk",
}

export default async function Account() {
  void getQueryClient().prefetchQuery(userSettingsQueryOptions())
  return (
    <HydrateClient>
      <Suspense fallback={<SettingsLoading />}>
        <AccountSettings />
      </Suspense>
    </HydrateClient>
  )
}
