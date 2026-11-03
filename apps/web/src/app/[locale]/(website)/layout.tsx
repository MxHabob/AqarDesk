import "@/website/styles/globals.css"
import { cn } from "@aqardesk/ui/lib/utils"
import "@aqardesk/ui/globals.css"
import type { Metadata } from "next"
import { Hedvig_Letters_Sans, Hedvig_Letters_Serif } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import type { ReactNode } from "react"
import { Footer } from "@/website/components/footer"
import { Header } from "@/website/components/header"
import { SunsetBanner } from "@/website/components/sunset-banner"
import { ThemeProvider } from "@/website/components/theme-provider"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

const hedvigSans = Hedvig_Letters_Sans({
  weight: "400",
  subsets: ["latin"],
  display: "optional",
  variable: "--font-hedvig-sans",
  preload: true,
  adjustFontFallback: true,
  fallback: ["system-ui", "arial"],
})

const hedvigSerif = Hedvig_Letters_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "optional",
  variable: "--font-hedvig-serif",
  preload: true,
  adjustFontFallback: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
})

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Midday — The business stack for modern founders",
    template: "%s | Midday",
  },
  description:
    "Invoicing, automatic reconciliation, time tracking, documents, and financial exports in one place. The business stack that replaces the tools you've outgrown.",
  openGraph: {
    title: "Midday — The business stack for modern founders",
    description:
      "Invoicing, automatic reconciliation, time tracking, documents, and financial exports in one place. The business stack that replaces the tools you've outgrown.",
    url: baseUrl,
    siteName: "Midday",
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
    title: "Midday — The business stack for modern founders",
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

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)" },
    { media: "(prefers-color-scheme: dark)" },
  ],
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Midday",
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

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div
      lang={locale}
      suppressHydrationWarning
      className={cn(
        `${hedvigSans.variable} ${hedvigSerif.variable} font-sans`,
        "bg-background overflow-x-hidden font-sans antialiased"
      )}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <NuqsAdapter>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SunsetBanner />
          <Header />
          <main className="container mx-auto px-4 pt-9 overflow-hidden md:overflow-visible">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </NuqsAdapter>
    </div>
  )
}
