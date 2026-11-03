import {
  createI18nServer,
  setStaticParamsLocale,
} from "next-international/server"
import en from "./en"

export { setStaticParamsLocale }

export const { getI18n, getScopedI18n, getStaticParams } = createI18nServer(
  {
    ar: () => import("./ar"),
    en: () => import("./en"),
  },
  { fallbackLocale: en }
)
