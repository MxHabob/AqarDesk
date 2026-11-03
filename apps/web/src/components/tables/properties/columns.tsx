"use client"

import { propertyCategories } from "@aqardesk/categories"
import type { listProperties } from "@aqardesk/database/queries"
import { Button } from "@aqardesk/ui/components/button"
import { Checkbox } from "@aqardesk/ui/components/checkbox"
import type { ColumnDef } from "@tanstack/react-table"
import type { useRealEstateParams } from "@/hooks/use-real-estate-params"

export type PropertyRow = Awaited<ReturnType<typeof listProperties>>[number]

type SetParams = ReturnType<typeof useRealEstateParams>["setParams"]
type PropertyLabels = {
  property: string
  city: string
  district: string
  area: string
  actions: string
  view: string
  edit: string
  notAvailable: string
  squareMeters: string
  selectAll: string
  selectRow: string
}

export function getPropertiesColumns(
  setParams: SetParams,
  locale: string,
  labels: PropertyLabels
): ColumnDef<PropertyRow>[] {
  const categoryNames = new Map(
    propertyCategories.map((category) => [
      category.type,
      locale === "ar" ? category.nameAr : category.nameEn,
    ])
  )

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
      accessorKey: "title",
      header: labels.property,
      size: 280,
      minSize: 200,
      cell: ({ row }) => (
        <div className="min-w-40">
          <p className="font-medium">{row.original.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {categoryNames.get(row.original.type) ?? row.original.type}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "city",
      header: labels.city,
      size: 220,
      minSize: 150,
      cell: ({ row }) =>
        [row.original.city, row.original.district]
          .filter(Boolean)
          .join(locale === "ar" ? "، " : ", ") || labels.notAvailable,
    },
    {
      accessorKey: "neighborhood",
      header: labels.district,
      size: 180,
      minSize: 130,
      cell: ({ getValue }) => getValue() || labels.notAvailable,
    },
    {
      accessorKey: "lotAreaM2",
      header: labels.area,
      size: 140,
      minSize: 110,
      cell: ({ getValue }) => {
        const area = getValue<number | null>()
        return area ? `${area} ${labels.squareMeters}` : labels.notAvailable
      },
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
              setParams({
                propertyId: row.original.id,
                propertyMode: "details",
              })
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
              setParams({
                propertyId: row.original.id,
                propertyMode: "edit",
              })
            }}
          >
            {labels.edit}
          </Button>
        </div>
      ),
    },
  ]
}
