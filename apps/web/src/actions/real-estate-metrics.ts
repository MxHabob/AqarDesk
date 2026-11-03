"use server"

import { auth } from "@aqardesk/auth/server"
import { getRealEstateMetrics } from "@aqardesk/database/queries"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { hasPermission } from "@/lib/auth/permissions"

const metricsInputSchema = z
  .object({
    from: z.iso.date(),
    to: z.iso.date(),
  })
  .refine(({ from, to }) => from <= to, {
    message: "The start date must be before the end date.",
  })

export async function getRealEstateMetricsAction(input: {
  from: string
  to: string
}) {
  const { from, to } = metricsInputSchema.parse(input)
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const [properties, listings, owners] = await Promise.all([
    hasPermission(session.user.id, "properties.read"),
    hasPermission(session.user.id, "listings.read"),
    hasPermission(session.user.id, "owners.read"),
  ])

  const fromDate = new Date(`${from}T00:00:00.000Z`)
  const toDate = new Date(`${to}T23:59:59.999Z`)
  const previousFrom = new Date(fromDate)
  previousFrom.setUTCFullYear(previousFrom.getUTCFullYear() - 1)
  const previousTo = new Date(toDate)
  previousTo.setUTCFullYear(previousTo.getUTCFullYear() - 1)

  return getRealEstateMetrics(
    { from: fromDate, to: toDate, previousFrom, previousTo },
    { properties, listings, owners }
  )
}
