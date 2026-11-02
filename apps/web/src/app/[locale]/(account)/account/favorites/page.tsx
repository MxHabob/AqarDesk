import { auth } from "@aqardesk/auth/server"
import { getDatabase, schema } from "@aqardesk/database"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/components/card"
import { and, desc, eq, gt, isNull, or } from "drizzle-orm"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { FavoriteToggleButton } from "@/components/account/favorite-toggle-button"
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
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("favoritesTitle")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("favoritesDescription")}
        </p>
      </header>
      {listings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("favoritesTitle")}</CardTitle>
            <CardDescription>{t("emptyFavorites")}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Card key={listing.id} className="flex flex-col">
              <CardHeader>
                <CardDescription>
                  {categories(listing.propertyType)}
                </CardDescription>
                <CardTitle>
                  <Link href={`/p/${listing.id}`}>{listing.title}</Link>
                </CardTitle>
                <CardDescription>
                  {[listing.city, listing.district]
                    .filter(Boolean)
                    .join(locale === "ar" ? "، " : ", ")}
                </CardDescription>
              </CardHeader>
              <div className="mt-auto px-6 pb-6">
                <FavoriteToggleButton listingId={listing.id} initialFavorite />
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
