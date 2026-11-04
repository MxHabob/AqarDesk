"use server"

import { cookies } from "next/headers"
import { z } from "zod"
import { isWebsiteCountryCode } from "@/lib/countries"
import { locales } from "@/locales/config"

const websitePreferencesSchema = z.object({
  locale: z.enum(locales),
  countryCode: z.string().refine(isWebsiteCountryCode),
})

export async function saveWebsitePreferences(input: unknown) {
  const { locale, countryCode } = websitePreferencesSchema.parse(input)
  const cookieStore = await cookies()
  const options = { path: "/", maxAge: 31_536_000, sameSite: "lax" as const }

  cookieStore.set("Next-Locale", locale, options)
  cookieStore.set("Next-Country", countryCode, options)
}
