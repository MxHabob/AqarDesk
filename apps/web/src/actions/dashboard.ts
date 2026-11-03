"use server"

import { auth } from "@aqardesk/auth/server"
import { getRealEstateDashboardSummary } from "@aqardesk/database/queries"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/auth/permissions"

export async function getDashboardSummaryAction() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const [properties, listings, owners] = await Promise.all([
    hasPermission(session.user.id, "properties.read"),
    hasPermission(session.user.id, "listings.read"),
    hasPermission(session.user.id, "owners.read"),
  ])
  const access = { properties, listings, owners }
  const summary = await getRealEstateDashboardSummary(access)

  return { ...summary, access }
}
