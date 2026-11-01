export const locales = ["ar", "en"] as const
export type AppLocale = (typeof locales)[number]
