"use client"

import { Button } from "@aqardesk/ui/components/button"
import { Input } from "@aqardesk/ui/components/input"
import Link from "next/link"
import { useCurrentLocale, useI18n } from "@/locales/client"

export function ListingsTableHeader({
  searchValue,
  onSearchChange,
  onCreate,
}: {
  searchValue: string
  onSearchChange: (value: string) => void
  onCreate: () => void
}) {
  const locale = useCurrentLocale()
  const t = useI18n()

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("common.listings")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("realEstateTables.listingsDescription")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/${locale}/dashboard/transactions?createProperty=true`}
            className="inline-flex h-9 items-center border border-border px-3 text-xs font-semibold tracking-widest uppercase transition-colors hover:bg-muted"
          >
            {t("realEstateTables.createProperty")}
          </Link>
          <Button type="button" onClick={onCreate}>
            {t("realEstateTables.addListing")}
          </Button>
        </div>
      </header>
      <Input
        aria-label={t("realEstateTables.searchListings")}
        autoComplete="off"
        placeholder={`${t("realEstateTables.searchListings")}...`}
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>
  )
}
