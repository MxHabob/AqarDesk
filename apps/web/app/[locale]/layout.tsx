import type { Metadata } from "next"
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)" },
    { media: "(prefers-color-scheme: dark)" },
  ],
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
    <html lang={locale} suppressHydrationWarning>
      <body className={cn("whitespace-pre-line overscroll-none antialiased")}>
        <Providers locale={locale as AppLocale}>{children}</Providers>
      </body>
    </html>
  )
}
