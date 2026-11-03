import type { AppLocale } from "@/locales/config"
import { locales } from "@/locales/config"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

function isAppLocale(locale: string): locale is AppLocale {
  return locales.some((supportedLocale) => supportedLocale === locale)
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isAppLocale(locale)) {
    notFound()
  }

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body>{children}</body>
    </html>
  )
}
