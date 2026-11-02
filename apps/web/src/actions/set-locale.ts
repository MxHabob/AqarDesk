"use server"

import { cookies } from "next/headers"
import { z } from "zod"

import { locales } from "@/locales/config"

const localeSchema = z.enum(locales)

export async function setLocaleAction(locale: string) {
  const parsedLocale = localeSchema.safeParse(locale)

  if (!parsedLocale.success) {
    throw new Error("Unsupported locale.")
  }

  const cookieStore = await cookies()
  cookieStore.set("Next-Locale", parsedLocale.data, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}
