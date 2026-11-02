"use client"

import { Toaster } from "@aqardesk/ui/components/toaster"
import { TooltipProvider } from "@aqardesk/ui/components/tooltip"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import type { ReactNode } from "react"
import { useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import {
  type AppLocale,
  I18nProviderClient,
  useScopedI18n,
} from "@/locales/client"

function LocalizedOverlays({ children }: { children: ReactNode }) {
  const common = useScopedI18n("common")

  return (
    <>
      {children}
      <Toaster closeLabel={common("close")} />
    </>
  )
}

export function Providers({
  children,
  locale,
}: {
  children: ReactNode
  locale: AppLocale
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <I18nProviderClient locale={locale}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NuqsAdapter>
            <TooltipProvider>
              <LocalizedOverlays>{children}</LocalizedOverlays>
            </TooltipProvider>
          </NuqsAdapter>
        </QueryClientProvider>
      </ThemeProvider>
    </I18nProviderClient>
  )
}
