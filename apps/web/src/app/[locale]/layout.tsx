import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import "@aqardesk/ui/globals.css"

import { cn } from "@aqardesk/ui/lib/utils"
import { type AppLocale, locales } from "@/locales/config"
import { getStaticParams } from "@/locales/server"
import { Providers } from "./providers"

export function generateStaticParams() {
  return getStaticParams()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  if (!locales.includes(locale as AppLocale)) {
    notFound()
  }

  const translations = (await import(`@/locales/${locale}`)).default
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  return {
    metadataBase: new URL(appUrl),
    title: {
      default: translations.metadata.title,
      template: `%s | ${translations.metadata.title}`,
    },
    description: translations.metadata.description,
    applicationName: "AqarDesk",
    category: "real estate",
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      siteName: "AqarDesk",
      title: translations.metadata.title,
      description: translations.metadata.description,
    },
    twitter: {
      card: "summary",
      title: translations.metadata.title,
      description: translations.metadata.description,
    },
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as AppLocale)) {
    notFound()
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        dir={locale === "ar" ? "rtl" : "ltr"}
        className={cn(
          "min-h-svh whitespace-pre-line overscroll-none antialiased"
        )}
      >
        <Providers locale={locale as AppLocale}>{children}</Providers>
      </body>
    </html>
  )
}
