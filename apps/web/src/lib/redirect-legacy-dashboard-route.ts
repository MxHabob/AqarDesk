import { redirect } from "next/navigation"

type SearchParams = Record<string, string | string[] | undefined>

export async function redirectLegacyDashboardRoute({
  params,
  searchParams,
  destination,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
  destination: string
}) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ])
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (typeof value === "string") {
      query.append(key, value)
    } else if (value) {
      for (const item of value) query.append(key, item)
    }
  }

  const queryString = query.toString()
  redirect(
    `/${locale}/dashboard/${destination}${queryString ? `?${queryString}` : ""}`
  )
}
