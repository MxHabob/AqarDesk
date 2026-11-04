"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aqardesk/ui/select"
import { useTransition } from "react"
import { saveWebsitePreferences } from "@/actions/website-preferences"
import { websiteCountries } from "@/lib/countries"
import { useScopedI18n } from "@/locales/client"

const countryTranslationKeys = {
  YE: "countryYemen",
  EG: "countryEgypt",
  SA: "countrySaudiArabia",
  AE: "countryUnitedArabEmirates",
  BH: "countryBahrain",
  KW: "countryKuwait",
  JO: "countryJordan",
  QA: "countryQatar",
  OM: "countryOman",
  IQ: "countryIraq",
  LB: "countryLebanon",
  US: "countryUnitedStates",
  GB: "countryUnitedKingdom",
  CA: "countryCanada",
  AU: "countryAustralia",
  IN: "countryIndia",
  PK: "countryPakistan",
} as const

export function HeaderPreferences({
  idPrefix,
  locale,
  countryCode,
}: {
  idPrefix: string
  locale: string
  countryCode: string
}) {
  const t = useScopedI18n("site")
  const localeId = `${idPrefix}-header-locale`
  const countryId = `${idPrefix}-header-country`
  const isCompact = idPrefix === "mobile"
  const [isPending, startTransition] = useTransition()
  const countryName = (country: (typeof websiteCountries)[number]) =>
    t(countryTranslationKeys[country.code])
  const selectedCountry = websiteCountries.find(
    (country) => country.code === countryCode
  )
  const updatePreference = (nextLocale: string, nextCountryCode: string) => {
    startTransition(async () => {
      await saveWebsitePreferences({
        locale: nextLocale,
        countryCode: nextCountryCode,
      })
    })
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Select
        value={locale}
        onValueChange={(value) => {
          if (value !== null) updatePreference(value, countryCode)
        }}
      >
        <SelectTrigger
          id={localeId}
          aria-label={t("language")}
          disabled={isPending}
          className={
            isCompact ? "h-9 w-14 px-2 text-xs" : "h-9 w-24 px-2 text-xs"
          }
        >
          <SelectValue>
            {isCompact
              ? locale.toUpperCase()
              : locale === "ar"
                ? t("arabic")
                : t("english")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent positionerClassName="z-[70]">
          <SelectItem value="ar">{t("arabic")}</SelectItem>
          <SelectItem value="en">{t("english")}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={countryCode}
        onValueChange={(value) => {
          if (value !== null) updatePreference(locale, value)
        }}
      >
        <SelectTrigger
          id={countryId}
          aria-label={t("country")}
          disabled={isPending}
          className={
            isCompact ? "h-9 w-16 px-2 text-xs" : "h-9 w-36 px-2 text-xs"
          }
        >
          <SelectValue>
            {isCompact
              ? countryCode
              : selectedCountry
                ? countryName(selectedCountry)
                : countryCode}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="min-w-56" positionerClassName="z-[70]">
          {websiteCountries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {countryName(country)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
