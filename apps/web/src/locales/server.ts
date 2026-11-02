import {
  createI18nServer,
  setStaticParamsLocale,
} from "next-international/server"

import { locales } from "./config"

export const { getCurrentLocale, getI18n, getScopedI18n, getStaticParams } =
  createI18nServer({
    ar: () => import("./ar"),
    en: () => import("./en"),
  })

export async function initializeLocale(
  params: Promise<{ locale: string }>
) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return locale
}

export { locales }
