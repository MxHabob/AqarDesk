"use client"

import { createI18nClient } from "next-international/client"
import en from "./en"

export const languages = ["ar", "en"] as const

export const {
  useScopedI18n,
  I18nProviderClient,
  useCurrentLocale,
  useChangeLocale,
  useI18n,
} = createI18nClient(
  {
    ar: () => import("./ar"),
    en: () => import("./en"),
  },
  { fallbackLocale: en }
)
