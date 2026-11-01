"use client"

import { createI18nClient } from "next-international/client"

export { type AppLocale, locales } from "./config"

export const {
  I18nProviderClient,
  useChangeLocale,
  useCurrentLocale,
  useI18n,
  useScopedI18n,
} = createI18nClient({
  ar: () => import("./ar"),
  en: () => import("./en"),
})
