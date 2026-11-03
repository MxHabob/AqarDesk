import "@/styles/marketing.css"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Footer } from "@/components/marketing/footer"
import { Header } from "@/components/marketing/header"
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
    description: "Manage real estate properties, listings, and owners with AqarDesk.",
    url: baseUrl,
    siteName: "AqarDesk",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: "AqarDesk — Real Estate Management",
    description: "Manage real estate properties, listings, and owners with AqarDesk.",
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

export default function Layout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="bg-background overflow-x-clip font-sans antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <SunsetBanner />
      <Header />
      <main className="container mx-auto px-4 pt-9 overflow-hidden md:overflow-visible">
        {children}
      </main>
      <Footer />
    </div>
  )
}
