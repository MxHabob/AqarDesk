"use client"

import type { listOwners } from "@aqardesk/database/queries"
import { Button } from "@aqardesk/ui/components/button"
import type { ColumnDef } from "@tanstack/react-table"
import type { useRealEstateParams } from "@/hooks/use-real-estate-params"

export type OwnerRow = Awaited<ReturnType<typeof listOwners>>[number]

type SetParams = ReturnType<typeof useRealEstateParams>["setParams"]
type OwnerLabels = {
  owner: string
  notes: string
  dateAdded: string
  actions: string
  view: string
  edit: string
  notAvailable: string
}

export function getOwnersColumns(
  setParams: SetParams,
  locale: string,
  labels: OwnerLabels
): ColumnDef<OwnerRow>[] {
  return [
    {
      accessorKey: "name",
      header: labels.owner,
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "notes",
      header: labels.notes,
      cell: ({ getValue }) => getValue<string | null>() || labels.notAvailable,
    },
    {
      accessorKey: "createdAt",
      header: labels.dateAdded,
      cell: ({ getValue }) =>
        new Intl.DateTimeFormat(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(getValue<Date>()),
    },
    {
      id: "actions",
      header: labels.actions,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() =>
              setParams({ ownerId: row.original.id, ownerMode: "details" })
            }
          >
            {labels.view}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() =>
              setParams({ ownerId: row.original.id, ownerMode: "edit" })
            }
          >
            {labels.edit}
          </Button>
        </div>
      ),
    },
  ]
}
