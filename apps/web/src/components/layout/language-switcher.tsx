"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { setLocaleAction } from "@/actions/set-locale"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import { locales } from "@/locales/config"

export function LanguageSwitcher() {
  const router = useRouter()
  const currentLocale = useCurrentLocale()
  const t = useScopedI18n("site")
  const [isPending, setIsPending] = useState(false)
  const [hasError, setHasError] = useState(false)

  async function changeLocale(locale: string) {
    const nextLocale = locales.find(
      (supportedLocale) => supportedLocale === locale
    )

    if (!nextLocale || nextLocale === currentLocale) {
      return
    }

    setIsPending(true)
    setHasError(false)

    try {
      await setLocaleAction(nextLocale)
      router.refresh()
    } catch {
      setHasError(true)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <select
        aria-label={t("language")}
        className="h-9 border border-input bg-background px-2 text-sm"
        value={currentLocale}
        disabled={isPending}
        onChange={(event) => changeLocale(event.target.value)}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {t(locale === "ar" ? "arabic" : "english")}
          </option>
        ))}
      </select>
      {hasError && (
        <span role="alert" className="text-sm text-destructive">
          {t("languageError")}
        </span>
      )}
    </>
  )
}
