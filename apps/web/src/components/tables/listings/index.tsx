"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@aqardesk/ui/components/table"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useRealEstateParams } from "@/hooks/use-real-estate-params"
import { useCurrentLocale, useI18n } from "@/locales/client"
import { realEstateQueries } from "@/queries/real-estate"
import { getListingsColumns } from "./columns"
import { ListingsTableHeader } from "./table-header"

export function ListingsTable() {
  const { setParams } = useRealEstateParams()
  const locale = useCurrentLocale()
  const t = useI18n()
  const { data: result } = useSuspenseQuery(realEstateQueries.listings())
  const data = result.rows
  const [globalFilter, setGlobalFilter] = useState("")
  const columns = useMemo(
    () =>
      getListingsColumns(setParams, locale, {
        property: t("realEstateTables.propertyTitle"),
        listingType: t("realEstateTables.listingType"),
        sale: t("realEstateTables.sale"),
        rent: t("realEstateTables.rent"),
        status: t("realEstateTables.status"),
        statuses: {
          draft: t("realEstateTables.statusDraft"),
          active: t("realEstateTables.statusActive"),
          reserved: t("realEstateTables.statusReserved"),
          sold: t("realEstateTables.statusSold"),
          rented: t("realEstateTables.statusRented"),
          expired: t("realEstateTables.statusExpired"),
          withdrawn: t("realEstateTables.statusWithdrawn"),
        },
        price: t("realEstateTables.price"),
        actions: t("realEstateTables.actions"),
        view: t("realEstateTables.view"),
        edit: t("realEstateTables.edit"),
        notAvailable: t("common.notAvailable"),
      }),
    [locale, setParams, t]
  )
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <section className="w-full space-y-5 py-6">
      <ListingsTableHeader
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        onCreate={() => setParams({ createListing: true })}
      />
      <div className="w-full overflow-x-auto border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : undefined
                    }
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {{
                      asc: " ↑",
                      desc: " ↓",
                    }[header.column.getIsSorted() as string] ?? null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-40 text-center text-sm text-muted-foreground"
                  colSpan={columns.length}
                >
                  {t("realEstateTables.noListings")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("realEstateTables.recordCount", {
          count: table.getFilteredRowModel().rows.length,
        })}
      </p>
    </section>
  )
}

export { ListingsSkeleton } from "./skeleton"
export { ListingsTableHeader } from "./table-header"
