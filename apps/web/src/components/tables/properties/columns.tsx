"use client"

import { propertyCategories } from "@aqardesk/categories"
import type { listProperties } from "@aqardesk/database/queries"
import { Button } from "@aqardesk/ui/components/button"
import type { ColumnDef } from "@tanstack/react-table"
import type { useRealEstateParams } from "@/hooks/use-real-estate-params"

export type PropertyRow = Awaited<ReturnType<typeof listProperties>>[number]

type SetParams = ReturnType<typeof useRealEstateParams>["setParams"]

const categoryNames = new Map(
  propertyCategories.map((category) => [category.type, category.nameAr])
)

export function getPropertiesColumns(
  setParams: SetParams
): ColumnDef<PropertyRow>[] {
  return [
    {
      accessorKey: "title",
      header: "العقار",
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
      header: "المدينة",
      cell: ({ row }) =>
        [row.original.city, row.original.district].filter(Boolean).join("، ") ||
        "—",
    },
    {
      accessorKey: "neighborhood",
      header: "الحي",
      cell: ({ getValue }) => getValue() || "—",
    },
    {
      accessorKey: "lotAreaM2",
      header: "المساحة",
      cell: ({ getValue }) => {
        const area = getValue<number | null>()
        return area ? `${area} م²` : "—"
      },
    },
    {
      id: "actions",
      header: "الإجراءات",
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
            عرض
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
            تعديل
          </Button>
        </div>
      ),
    },
  ]
}
