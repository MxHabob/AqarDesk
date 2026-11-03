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
import { getOwnersColumns } from "./columns"
import { OwnersTableHeader } from "./table-header"

export function OwnersTable() {
  const { setParams } = useRealEstateParams()
  const locale = useCurrentLocale()
  const t = useI18n()
  const { data } = useSuspenseQuery(realEstateQueries.owners())
  const [globalFilter, setGlobalFilter] = useState("")
  const columns = useMemo(
    () =>
      getOwnersColumns(setParams, locale, {
        owner: t("realEstateTables.owner"),
        notes: t("realEstateTables.notes"),
        dateAdded: t("realEstateTables.dateAdded"),
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
      <OwnersTableHeader
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        onCreate={() => setParams({ createOwner: true })}
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
                  {t("realEstateTables.noOwners")}
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

export { OwnersSkeleton } from "./skeleton"
export { OwnersTableHeader } from "./table-header"
