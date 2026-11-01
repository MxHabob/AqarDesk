"use client"

import type { ReactNode } from "react"

import { Toaster } from "@aqardesk/ui/components/toaster"
import { TooltipProvider } from "@aqardesk/ui/components/tooltip"

import { I18nProviderClient, type AppLocale } from "@/locales/client"
import { ThemeProvider } from "@/components/theme-provider"

export function Providers({
  children,
  locale,
}: {
  children: ReactNode
  locale: AppLocale
}) {
  return (
    <I18nProviderClient locale={locale}>
      <ThemeProvider>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </I18nProviderClient>
  )
}
