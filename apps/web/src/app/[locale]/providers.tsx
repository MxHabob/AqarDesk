"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import type { AppLocale } from "@/locales/config"
import { I18nProviderClient } from "@/locales/client"
import { TRPCReactProvider } from "@/trpc/client"
import { NuqsAdapter } from "nuqs/adapters/next/app"

export function Providers({
  locale,
  children,
}: {
  locale: AppLocale
  children: ReactNode
}) {
  return (
    <NuqsAdapter>
      <TRPCReactProvider>
        <I18nProviderClient locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </I18nProviderClient>
      </TRPCReactProvider>
    </NuqsAdapter>
  )
}
