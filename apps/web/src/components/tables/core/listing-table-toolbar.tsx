"use client"

import { Button } from "@aqardesk/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@aqardesk/ui/components/dropdown-menu"
import type { Table } from "@tanstack/react-table"
import { useScopedI18n } from "@/locales/client"
import type { ListingRow } from "./listing-types"

export function ListingTableToolbar({
  table,
  selectedCount,
}: {
  table: Table<ListingRow>
  selectedCount: number
}) {
  const t = useScopedI18n("common")

  return (
    <div className="flex min-h-9 items-center justify-between gap-3">
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {selectedCount ? `${selectedCount} ${t("selectedRows")}` : null}
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
          {t("columns")}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(visible) => column.toggleVisibility(visible)}
              >
                {typeof column.columnDef.header === "string"
                  ? column.columnDef.header
                  : column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
