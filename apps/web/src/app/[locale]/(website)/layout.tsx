import "@/website/styles/globals.css"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Footer } from "@/website/components/footer"
import { Header } from "@/website/components/header"
import { SunsetBanner } from "@/website/components/sunset-banner"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "AqarDesk — The business stack for modern founders",
    template: "%s | AqarDesk",
  },
  description:
    "Invoicing, automatic reconciliation, time tracking, documents, and financial exports in one place. The business stack that replaces the tools you've outgrown.",
  openGraph: {
    title: "AqarDesk — The business stack for modern founders",
    description:
      "Invoicing, automatic reconciliation, time tracking, documents, and financial exports in one place. The business stack that replaces the tools you've outgrown.",
    url: baseUrl,
    siteName: "AqarDesk",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://cdn.midday.ai/opengraph-image-v1.jpg",
        width: 800,
        height: 600,
      },
      {
        url: "https://cdn.midday.ai/opengraph-image-v1.jpg",
        width: 1800,
        height: 1600,
      },
    ],
  },
  twitter: {
    title: "AqarDesk — The business stack for modern founders",
    description:
      "Invoicing, automatic reconciliation, time tracking, documents, and financial exports in one place. The business stack that replaces the tools you've outgrown.",
    images: [
      {
        url: "https://cdn.midday.ai/opengraph-image-v1.jpg",
        width: 800,
        height: 600,
      },
      {
        url: "https://cdn.midday.ai/opengraph-image-v1.jpg",
        width: 1800,
        height: 1600,
      },
    ],
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
  url: "https://midday.ai",
  logo: "https://cdn.midday.ai/logo.png",
  sameAs: [
    "https://x.com/middayai",
    "https://github.com/midday-ai/midday",
    "https://linkedin.com/company/midday-ai",
  ],
  description:
    "Invoicing, automatic reconciliation, time tracking, documents, and financial exports in one place. The business stack that replaces the tools you've outgrown.",
}

export default function Layout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="bg-background overflow-x-hidden font-sans antialiased">
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
