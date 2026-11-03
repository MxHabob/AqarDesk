import type { Metadata } from "next"
import { AccountSettings } from "@/components/account-settings"
import { getQueryClient, HydrateClient } from "@/queries/server"
import { userSettingsQueryOptions } from "@/queries/user-settings"

export const metadata: Metadata = {
  title: "Account Settings | AqarDesk",
}

export default async function Account() {
  await getQueryClient().prefetchQuery(userSettingsQueryOptions())
  return (
    <HydrateClient>
      <AccountSettings />
    </HydrateClient>
  )
}
