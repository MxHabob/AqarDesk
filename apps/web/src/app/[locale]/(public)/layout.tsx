import "@/styles/globals.css"
import { cn } from "@aqardesk/ui/lib/utils"
import "@aqardesk/ui/globals.css"
import { Toaster } from "@aqardesk/ui/components/toaster"
import type { Metadata } from "next"
import { Hedvig_Letters_Sans, Hedvig_Letters_Serif } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import type { ReactNode } from "react"
import { Providers } from "@/app/[locale]/dashboard/providers"
import { DesktopHeader } from "@/components/desktop-header"

export const metadata: Metadata = {
  title: "AqarDesk | Run your business smarter",
  description:
    "Automate financial tasks, stay organized, and make informed decisions effortlessly.",
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

export default async function PublicLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div
      className={cn(
        `${hedvigSans.variable} ${hedvigSerif.variable} font-sans`,
        "whitespace-pre-line overscroll-none antialiased"
      )}
    >
      <DesktopHeader />
      <NuqsAdapter>
        <Providers locale={locale}>
          {children}
          <Toaster />
        </Providers>
      </NuqsAdapter>
    </div>
  )
}
