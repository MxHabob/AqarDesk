"use client"

import { propertyCategories } from "@aqardesk/categories"
import type { listProperties } from "@aqardesk/database/queries"
import { Button } from "@aqardesk/ui/components/button"
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
      accessorKey: "title",
      header: labels.property,
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
      cell: ({ row }) =>
        [row.original.city, row.original.district]
          .filter(Boolean)
          .join(locale === "ar" ? "، " : ", ") || labels.notAvailable,
    },
    {
      accessorKey: "neighborhood",
      header: labels.district,
      cell: ({ getValue }) => getValue() || labels.notAvailable,
    },
    {
      accessorKey: "lotAreaM2",
      header: labels.area,
      cell: ({ getValue }) => {
        const area = getValue<number | null>()
        return area ? `${area} ${labels.squareMeters}` : labels.notAvailable
      },
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
              setParams({
                propertyId: row.original.id,
                propertyMode: "details",
              })
            }
          >
            {labels.view}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() =>
              setParams({
                propertyId: row.original.id,
                propertyMode: "edit",
              })
            }
          >
            {labels.edit}
          </Button>
        </div>
      ),
    },
  ]
}
