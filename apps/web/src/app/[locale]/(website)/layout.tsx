import "@/styles/marketing.css"
import { auth } from "@aqardesk/auth/server"
import { headers } from "next/headers"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Footer } from "@/components/marketing/footer"
import { Header } from "@/components/marketing/header"
import { getRoleDestination, getUserRoleKeys } from "@/lib/auth/roles"
import { SunsetBanner } from "@/components/sunset-banner"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "AqarDesk — Real Estate Management",
    template: "%s | AqarDesk",
  },
  description:
    "Manage real estate properties, listings, and owners with AqarDesk.",
  openGraph: {
    title: "AqarDesk — Real Estate Management",
    description:
      "Manage real estate properties, listings, and owners with AqarDesk.",
    url: baseUrl,
    siteName: "AqarDesk",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: "AqarDesk — Real Estate Management",
    description:
      "Manage real estate properties, listings, and owners with AqarDesk.",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AqarDesk",
  url: baseUrl,
  description:
    "Manage real estate properties, listings, and owners with AqarDesk.",
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
  const roleKeys = session ? await getUserRoleKeys(session.user.id) : []
  const roleDestination = session ? getRoleDestination(roleKeys, locale) : null

  return (
    <div className="bg-background overflow-x-clip font-sans antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <SunsetBanner />
      <Header
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
