import { createI18nServer } from "next-international/server"
import en from "./en"

export const { getI18n, getScopedI18n, getStaticParams } = createI18nServer(
  {
    ar: () => import("./ar"),
    en: () => import("./en"),
  },
  { fallbackLocale: en }
)
