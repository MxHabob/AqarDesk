import { auth } from "@aqardesk/auth/server"
import { getDatabase, schema } from "@aqardesk/database"
import { and, desc, eq, gt, isNull, or } from "drizzle-orm"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { FavoritesGrid } from "@/components/account/favorites-grid"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { getScopedI18n, initializeLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  await initializeLocale(params)
  const t = await getScopedI18n("account")
  return {
    title: t("favoritesTitle"),
    robots: { index: false, follow: false },
  }
}

export default async function AccountFavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = await initializeLocale(params)
  const [t, categories, session] = await Promise.all([
    getScopedI18n("account"),
    getScopedI18n("propertyTypes"),
    auth.api.getSession({ headers: await headers() }),
  ])

  if (!session) {
    redirect("/account/login")
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
      <PageHeader title={t("favoritesTitle")} />
      {listings.length === 0 ? (
        <EmptyState description={t("emptyFavorites")} />
      ) : (
        <FavoritesGrid
          listings={listings}
          locale={locale}
          propertyTypeLabel={(type) => categories(type)}
        />
      )}
    </section>
  )
}
