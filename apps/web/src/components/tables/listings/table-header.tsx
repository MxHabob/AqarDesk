"use client"

import { Button } from "@aqardesk/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@aqardesk/ui/components/dropdown-menu"
import { Input } from "@aqardesk/ui/components/input"
import type { Table } from "@tanstack/react-table"
import { Columns3 } from "lucide-react"
import Link from "next/link"
import { useCurrentLocale, useI18n } from "@/locales/client"

export function ListingsTableHeader<TData>({
  searchValue,
  onSearchChange,
  onCreate,
  table,
}: {
  searchValue: string
  onSearchChange: (value: string) => void
  onCreate: () => void
  table: Table<TData>
}) {
  const locale = useCurrentLocale()
  const t = useI18n()
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide())

  return (
    <div className="shrink-0">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("common.listings")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("realEstateTables.listingsDescription")}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Input
            className="h-9 min-w-0 flex-1 sm:w-64 sm:flex-none"
            aria-label={t("realEstateTables.searchListings")}
            autoComplete="off"
            placeholder={`${t("realEstateTables.searchListings")}...`}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={t("common.columns")}
                  title={t("common.columns")}
                />
              }
            >
              <Columns3 aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{t("common.columns")}</DropdownMenuLabel>
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(checked) =>
                    column.toggleVisibility(checked)
                  }
                  onSelect={(event) => event.preventDefault()}
                >
                  {typeof column.columnDef.header === "string"
                    ? column.columnDef.header
                    : column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            href={`/${locale}/dashboard/properties?createProperty=true`}
            className="inline-flex h-9 items-center border border-border px-3 text-xs font-semibold tracking-widest uppercase transition-colors hover:bg-muted"
          >
            {t("realEstateTables.createProperty")}
          </Link>
          <Button type="button" onClick={onCreate}>
            {t("realEstateTables.addListing")}
          </Button>
        </div>
      </header>
    </div>
  )
}
