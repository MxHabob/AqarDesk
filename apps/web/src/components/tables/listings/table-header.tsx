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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aqardesk/ui/components/select"
import type { Table } from "@tanstack/react-table"
import { Columns3 } from "lucide-react"
import Link from "next/link"
import { useCurrentLocale, useI18n } from "@/locales/client"

export function ListingsTableHeader<TData>({
  searchValue,
  onSearchChange,
  onCreate,
  table,
  statusFilter,
  listingTypeFilter,
  onStatusFilterChange,
  onListingTypeFilterChange,
}: {
  searchValue: string
  onSearchChange: (value: string) => void
  onCreate: () => void
  table: Table<TData>
  statusFilter: string | null
  listingTypeFilter: string | null
  onStatusFilterChange: (value: string | null) => void
  onListingTypeFilterChange: (value: string | null) => void
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
          <Select
            value={listingTypeFilter ?? "all"}
            onValueChange={(value) =>
              onListingTypeFilterChange(value === "all" ? null : value)
            }
          >
            <SelectTrigger
              className="h-9 w-auto min-w-36"
              aria-label={t("realEstateTables.filterListingType")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("realEstateTables.allListingTypes")}
              </SelectItem>
              <SelectItem value="sale">{t("realEstateTables.sale")}</SelectItem>
              <SelectItem value="rent">{t("realEstateTables.rent")}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter ?? "all"}
            onValueChange={(value) =>
              onStatusFilterChange(value === "all" ? null : value)
            }
          >
            <SelectTrigger
              className="h-9 w-auto min-w-36"
              aria-label={t("realEstateTables.filterStatus")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("realEstateTables.allStatuses")}
              </SelectItem>
              <SelectItem value="draft">
                {t("realEstateTables.statusDraft")}
              </SelectItem>
              <SelectItem value="active">
                {t("realEstateTables.statusActive")}
              </SelectItem>
              <SelectItem value="reserved">
                {t("realEstateTables.statusReserved")}
              </SelectItem>
              <SelectItem value="sold">
                {t("realEstateTables.statusSold")}
              </SelectItem>
              <SelectItem value="rented">
                {t("realEstateTables.statusRented")}
              </SelectItem>
              <SelectItem value="expired">
                {t("realEstateTables.statusExpired")}
              </SelectItem>
              <SelectItem value="withdrawn">
                {t("realEstateTables.statusWithdrawn")}
              </SelectItem>
            </SelectContent>
          </Select>
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
