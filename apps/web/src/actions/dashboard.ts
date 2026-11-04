"use server"

import { auth } from "@aqardesk/auth/server"
import {
  getRealEstateDashboardSummary,
  listListings,
} from "@aqardesk/database/queries"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/auth/permissions"

export async function getDashboardSummaryAction() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const [
    properties,
    listings,
    owners,
    canCreateProperties,
    canCreateListings,
    canCreateOwners,
  ] = await Promise.all([
    hasPermission(session.user.id, "properties.read"),
    hasPermission(session.user.id, "listings.read"),
    hasPermission(session.user.id, "owners.read"),
    hasPermission(session.user.id, "properties.create"),
    hasPermission(session.user.id, "listings.create"),
    hasPermission(session.user.id, "owners.create"),
  ])
  const access = {
    properties,
    listings,
    owners,
    canCreateProperties,
    canCreateListings,
    canCreateOwners,
  }
  const [summary, recentListings] = await Promise.all([
    getRealEstateDashboardSummary(access),
    listings
      ? listListings({ pageSize: 5, sortBy: "createdAt", sortOrder: "desc" })
      : Promise.resolve({ rows: [] }),
  ])

  return { ...summary, access, recentListings: recentListings.rows }
}
