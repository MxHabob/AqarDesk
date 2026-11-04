import "server-only"

import { connection } from "next/server"
import type { ReactNode } from "react"
import { userSettingsQueryOptions } from "@/queries/user-settings"
import { getQueryClient, HydrateClient } from "./server"

export async function UserSettingsHydration({
  children,
}: {
  children: ReactNode
}) {
  await connection()
  void getQueryClient().prefetchQuery(userSettingsQueryOptions())

  return <HydrateClient>{children}</HydrateClient>
}
