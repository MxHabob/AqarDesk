"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import type { AppLocale } from "@/locales/config"
import { I18nProviderClient } from "@/locales/client"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { QueryProvider } from "@/queries/query-provider"

export function Providers({
  locale,
  children,
}: {
  locale: AppLocale
  children: ReactNode
}) {
  return (
    <NuqsAdapter>
      <QueryProvider>
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
      </QueryProvider>
    </NuqsAdapter>
  )
}
