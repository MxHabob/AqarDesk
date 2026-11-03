"use client"

import { Button } from "@aqardesk/ui/components/button"
import { Input } from "@aqardesk/ui/components/input"
import { useI18n } from "@/locales/client"

export function OwnersTableHeader({
  searchValue,
  onSearchChange,
  onCreate,
}: {
  searchValue: string
  onSearchChange: (value: string) => void
  onCreate: () => void
}) {
  const t = useI18n()

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("common.owners")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("realEstateTables.ownersDescription")}
          </p>
        </div>
        <Button type="button" onClick={onCreate}>
          {t("realEstateTables.addOwner")}
        </Button>
      </header>
      <Input
        aria-label={t("realEstateTables.searchOwners")}
        autoComplete="off"
        placeholder={`${t("realEstateTables.searchOwners")}...`}
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>
  )
}
