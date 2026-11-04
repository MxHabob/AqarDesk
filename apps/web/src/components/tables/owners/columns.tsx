"use client"

import type { listOwners } from "@aqardesk/database/queries"
import { Button } from "@aqardesk/ui/components/button"
import { Checkbox } from "@aqardesk/ui/components/checkbox"
import type { ColumnDef } from "@tanstack/react-table"
import type { useRealEstateParams } from "@/hooks/use-real-estate-params"

export type OwnerRow = Awaited<ReturnType<typeof listOwners>>[number]

type SetParams = ReturnType<typeof useRealEstateParams>["setParams"]
type OwnerLabels = {
  owner: string
  offers: string
  location: string
  officeContact: string
  sale: string
  rent: string
  viaOffice: string
  directContact: string
  notes: string
  dateAdded: string
  actions: string
  view: string
  edit: string
  notAvailable: string
  selectAll: string
  selectRow: string
}

export function getOwnersColumns(
  setParams: SetParams,
  locale: string,
  labels: OwnerLabels
): ColumnDef<OwnerRow>[] {
  return [
    {
      id: "select",
      size: 50,
      minSize: 50,
      maxSize: 50,
      enableResizing: false,
      enableHiding: false,
      enableSorting: false,
      meta: {
        sticky: true,
        className:
          "w-[50px] min-w-[50px] md:sticky md:start-0 bg-background group-hover:bg-[#F2F1EF] group-hover:dark:bg-[#0f0f0f] z-20",
      },
      header: ({ table }) => (
        <Checkbox
          aria-label={labels.selectAll}
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onCheckedChange={(checked) =>
            table.toggleAllPageRowsSelected(checked === true)
          }
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={labels.selectRow}
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(checked === true)}
        />
      ),
    },
    {
      accessorKey: "name",
      header: labels.owner,
      size: 240,
      minSize: 180,
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue<string>()}</span>
      ),
    },
    {
      id: "offers",
      accessorFn: (row) => row.offerTypes.join(" "),
      header: labels.offers,
      size: 220,
      minSize: 160,
      cell: ({ row }) => {
        const offers = row.original.offerTypes
          .map((type) => (type === "sale" ? labels.sale : labels.rent))
          .join("، ")
        return (
          [offers, row.original.buildingType].filter(Boolean).join(" · ") ||
          labels.notAvailable
        )
      },
    },
    {
      id: "location",
      accessorFn: (row) =>
        [row.city, row.district, row.neighborhood, row.street]
          .filter(Boolean)
          .join(" "),
      header: labels.location,
      size: 260,
      minSize: 180,
      cell: ({ row }) =>
        [
          row.original.city,
          row.original.district,
          row.original.neighborhood,
          row.original.street,
        ]
          .filter(Boolean)
          .join("، ") || labels.notAvailable,
    },
    {
      accessorKey: "contactViaOffice",
      header: labels.officeContact,
      size: 160,
      minSize: 120,
      cell: ({ getValue }) =>
        getValue<boolean>() ? labels.viaOffice : labels.directContact,
    },
    {
      accessorKey: "notes",
      header: labels.notes,
      size: 320,
      minSize: 200,
      cell: ({ getValue }) => getValue<string | null>() || labels.notAvailable,
    },
    {
      accessorKey: "createdAt",
      header: labels.dateAdded,
      size: 190,
      minSize: 150,
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
      enableHiding: false,
      meta: { sticky: true },
      size: 180,
      minSize: 150,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation()
              setParams({ ownerId: row.original.id, ownerMode: "details" })
            }}
          >
            {labels.view}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation()
              setParams({ ownerId: row.original.id, ownerMode: "edit" })
            }}
          >
            {labels.edit}
          </Button>
        </div>
      ),
    },
  ]
}
