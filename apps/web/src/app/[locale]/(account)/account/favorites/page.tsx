import { auth } from "@aqardesk/auth/server"
import { getDatabase, schema } from "@aqardesk/database"
import { and, desc, eq, gt, isNull, or } from "drizzle-orm"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "عقاراتي المفضلة | عقار دِسك",
  robots: { index: false, follow: false },
}

export default async function AccountFavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  const isArabic = locale === "ar"

  if (!session) {
    redirect(`/${locale}/login`)
  }

  const listings = await getDatabase()
    .select({
      id: schema.listings.id,
      title: schema.properties.title,
      propertyType: schema.properties.type,
      city: schema.properties.city,
      district: schema.properties.district,
    })
    .from(schema.favorites)
    .innerJoin(
      schema.listings,
      eq(schema.favorites.listingId, schema.listings.id)
    )
    .innerJoin(
      schema.properties,
      eq(schema.listings.propertyId, schema.properties.id)
    )
    .where(
      and(
        eq(schema.favorites.userId, session.user.id),
        eq(schema.listings.status, "active"),
        isNull(schema.properties.archivedAt),
        or(
          isNull(schema.listings.expiresAt),
          gt(schema.listings.expiresAt, new Date())
        )
      )
    )
    .orderBy(desc(schema.favorites.createdAt))

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">
          {isArabic ? "عقاراتي المفضلة" : "Saved properties"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isArabic
            ? "العقارات التي حفظتها للرجوع إليها."
            : "Properties you saved to revisit later."}
        </p>
      </div>
      {listings.length === 0 ? (
        <p className="rounded-lg border p-5 text-sm text-muted-foreground">
          {isArabic
            ? "لا توجد عقارات محفوظة."
            : "You have no saved properties."}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <li className="space-y-2 rounded-lg border p-4" key={listing.id}>
              <h2 className="font-medium">{listing.title}</h2>
              <p className="text-sm text-muted-foreground">
                {[listing.district, listing.city].filter(Boolean).join("، ")}
              </p>
              <p className="text-xs text-muted-foreground">
                {listing.propertyType}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
