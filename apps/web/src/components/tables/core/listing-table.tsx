"use client"

import { Checkbox } from "@aqardesk/ui/components/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@aqardesk/ui/components/table"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import { ListingTablePagination } from "./listing-table-pagination"
import { ListingTableToolbar } from "./listing-table-toolbar"
import type { ListingRow } from "./listing-types"

export function ListingTable({
  rows,
  total,
  page,
  pageSize,
  sortBy,
  sortOrder,
  onPageChange,
  onPageSizeChange,
  onSortChange,
}: {
  rows: ListingRow[]
  total: number
  page: number
  pageSize: number
  sortBy: "createdAt" | "title" | "price" | "status"
  sortOrder: "asc" | "desc"
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSortChange: (
    sortBy: "createdAt" | "title" | "price" | "status",
    sortOrder: "asc" | "desc"
  ) => void
}) {
  const t = useScopedI18n("listings")
  const common = useScopedI18n("common")
  const propertyTypes = useScopedI18n("propertyTypes")
  const currencyT = useScopedI18n("currency")
  const locale = useCurrentLocale()
  const sorting: SortingState = [{ id: sortBy, desc: sortOrder === "desc" }]
  const [rowSelection, setRowSelection] = useState({})
  const columns = useMemo<ColumnDef<ListingRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            aria-label={common("selectAll")}
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onCheckedChange={(checked) =>
              table.toggleAllPageRowsSelected(checked === true)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={common("selectRow")}
            checked={row.getIsSelected()}
            onCheckedChange={(checked) => row.toggleSelected(checked === true)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "title",
        header: () => t("nameColumn"),
        cell: ({ row }) => (
          <div className="max-w-72">
            <p className="truncate font-medium">{row.original.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {[row.original.city, row.original.district]
                .filter(Boolean)
                .join(locale === "ar" ? "، " : ", ") || common("notAvailable")}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "propertyType",
        header: () => t("typeColumn"),
        enableSorting: false,
        cell: ({ getValue }) => {
          const type = getValue<ListingRow["propertyType"]>()
          return propertyTypes(type)
        },
      },
      {
        accessorKey: "listingType",
        header: () => t("offerColumn"),
        enableSorting: false,
        cell: ({ getValue }) =>
          t(getValue<ListingRow["listingType"]>() === "sale" ? "sale" : "rent"),
      },
      {
        id: "price",
        accessorFn: (row) => row.salePrice ?? row.monthlyRent,
        header: () => t("priceColumn"),
        cell: ({ row }) => {
          const price = row.original.salePrice ?? row.original.monthlyRent
          return price
            ? `${new Intl.NumberFormat(locale, {
                maximumFractionDigits: 0,
              }).format(Number(price))} ${currencyT("sar")}`
            : common("notAvailable")
        },
      },
      {
        accessorKey: "status",
        header: () => t("statusColumn"),
        cell: ({ getValue }) => {
          const status = getValue<ListingRow["status"]>()
          switch (status) {
            case "draft":
              return t("statusDraft")
            case "active":
              return t("statusActive")
            case "reserved":
              return t("statusReserved")
            case "sold":
              return t("statusSold")
            case "rented":
              return t("statusRented")
            case "expired":
              return t("statusExpired")
            case "withdrawn":
              return t("statusWithdrawn")
          }
        },
      },
      {
        accessorKey: "createdAt",
        header: () => t("createdColumn"),
        cell: ({ getValue }) =>
          new Intl.DateTimeFormat(locale, {
            dateStyle: "medium",
          }).format(new Date(getValue<string>())),
      },
    ],
    [common, currencyT, locale, propertyTypes, t]
  )

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      const [first] = next
      if (
        first &&
        ["createdAt", "title", "price", "status"].includes(first.id)
      ) {
        onSortChange(first.id as typeof sortBy, first.desc ? "desc" : "asc")
      }
    },
    onRowSelectionChange: setRowSelection,
    state: { sorting, rowSelection },
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  })

  return (
    <div className="space-y-3">
      <ListingTableToolbar
        table={table}
        selectedCount={table.getSelectedRowModel().rows.length}
      />
      <div className="overflow-hidden border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === "asc"
                          ? " ↑"
                          : header.column.getIsSorted() === "desc"
                            ? " ↓"
                            : null}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
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
                  colSpan={columns.length}
                  className="h-28 text-center"
                >
                  {common("noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ListingTablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}
