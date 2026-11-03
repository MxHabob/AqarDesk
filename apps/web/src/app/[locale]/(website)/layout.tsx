import "@/styles/marketing.css"
import { auth } from "@aqardesk/auth/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import type { ReactNode } from "react"
import { Footer } from "@/components/marketing/footer"
import { Header } from "@/components/marketing/header"
import { SunsetBanner } from "@/components/sunset-banner"
import { getRoleDestination, getUserRoleKeys } from "@/lib/auth/roles"
import {
  getFilteredPublicListings,
  getPublicListingCoverPhotos,
  getSelectedPublicCountryCode,
} from "@/lib/listings/public-queries"
import {
  createSafeJsonLd,
  getMarketingPageCopy,
  getSiteUrl,
} from "@/lib/marketing/metadata"
import { locales } from "@/locales/config"
import { getScopedI18n } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getScopedI18n("site")
  const copy = getMarketingPageCopy("home", locale)
  const localizedUrl = getSiteUrl(`/${locale}`)

  return {
    title: {
      default: copy.title,
      template: t("titleTemplate"),
    },
    description: copy.description,
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: localizedUrl,
      siteName: t("officeName"),
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: locales
        .filter((item) => item !== locale)
        .map((item) => (item === "ar" ? "ar_SA" : "en_US")),
      type: "website",
      images: [
        {
          url: getSiteUrl("/api/og"),
          width: 1200,
          height: 630,
          alt: copy.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: [getSiteUrl("/api/og")],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const [{ locale }, session] = await Promise.all([
    params,
    auth.api.getSession({ headers: await headers() }),
  ])
  const t = await getScopedI18n("site")
  const countryCode = await getSelectedPublicCountryCode()
  const roleKeys = session ? await getUserRoleKeys(session.user.id) : []
  const roleDestination = session ? getRoleDestination(roleKeys, locale) : null
  const latestListings = await getFilteredPublicListings({
    q: "",
    propertyType: null,
    listingType: null,
    minPrice: null,
    maxPrice: null,
    minArea: null,
    maxArea: null,
    sort: "newest",
    page: 1,
    pageSize: 2,
  })
  const latestListingPhotos = await getPublicListingCoverPhotos(
    latestListings.rows.map((listing) => listing.id)
  )
  const listingPreviews = latestListings.rows.map((listing) => ({
    id: listing.id,
    title: listing.title,
    listingType: listing.type,
    location: [listing.city, listing.district].filter(Boolean).join("، "),
    image: latestListingPhotos[listing.id] ?? null,
  }))
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: t("officeName"),
    url: getSiteUrl(),
    logo: getSiteUrl("/appicon.png"),
    description: getMarketingPageCopy("home", locale).description,
  }
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: t("officeName"),
    url: getSiteUrl(`/${locale}`),
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: getSiteUrl(`/${locale}/listings?q={search_term_string}`),
      },
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <div className="bg-background overflow-x-clip font-sans antialiased">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is escaped by createSafeJsonLd.
        dangerouslySetInnerHTML={{
          __html: createSafeJsonLd(organizationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is escaped by createSafeJsonLd.
        dangerouslySetInnerHTML={{
          __html: createSafeJsonLd(websiteJsonLd),
        }}
      />
      <SunsetBanner locale={locale} />
      <Header
        countryCode={countryCode}
        listingPreviews={listingPreviews}
        locale={locale}
        user={
          session
            ? {
                name: session.user.name,
                email: session.user.email,
                image: session.user.image ?? null,
              }
            : null
        }
        roleDestination={roleDestination}
      />
      <main className="container mx-auto px-4 pt-9 overflow-hidden md:overflow-visible">
        {children}
      </main>
      <Footer />
    </div>
  )
}
