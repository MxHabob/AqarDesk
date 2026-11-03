import { auth } from "@aqardesk/auth/server"
import { listUserFavorites } from "@aqardesk/database/queries"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
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
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("account")
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect(`/${locale}/login`)
  }

  const listings = await listUserFavorites(session.user.id)

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">{t("favoritesTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("favoritesDescription")}
        </p>
      </div>
      {listings.length === 0 ? (
        <p className="rounded-lg border p-5 text-sm text-muted-foreground">
          {t("emptyFavorites")}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <li
              className="space-y-2 rounded-lg border p-4"
              key={listing.listingId}
            >
              <h2 className="font-medium">{listing.title}</h2>
              <p className="text-sm text-muted-foreground">
                {[listing.district, listing.city]
                  .filter(Boolean)
                  .join(t("locationSeparator"))}
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
