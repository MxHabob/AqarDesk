import { createI18nServer } from "next-international/server"

import { locales } from "./config"

export const { getCurrentLocale, getI18n, getScopedI18n, getStaticParams } =
  createI18nServer({
    ar: () => import("./ar"),
    en: () => import("./en"),
  })

export { locales }
