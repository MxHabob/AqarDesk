import "@/styles/globals.css"
import "@aqardesk/ui/globals.css"
import { Toaster } from "@aqardesk/ui/components/toaster"
import type { Metadata } from "next"
import { Hedvig_Letters_Sans, Hedvig_Letters_Serif } from "next/font/google"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import type { AppLocale } from "@/locales/config"
import { locales } from "@/locales/config"
import { Providers } from "./providers"

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

const hedvigSans = Hedvig_Letters_Sans({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hedvig-sans",
})

const hedvigSerif = Hedvig_Letters_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hedvig-serif",
})

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
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={`${hedvigSans.variable} ${hedvigSerif.variable} font-sans`}
    >
      <body className="whitespace-pre-line overscroll-none antialiased">
        <Providers locale={locale}>
          <Toaster>{children}</Toaster>
        </Providers>
      </body>
    </html>
  )
}
