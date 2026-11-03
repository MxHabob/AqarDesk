"use client"

import { propertyCategories } from "@aqardesk/categories"
import type { listListings } from "@aqardesk/database/queries"
import { Button } from "@aqardesk/ui/components/button"
import type { ColumnDef } from "@tanstack/react-table"
import type { useRealEstateParams } from "@/hooks/use-real-estate-params"

export type ListingRow = Awaited<
  ReturnType<typeof listListings>
>["rows"][number]

type SetParams = ReturnType<typeof useRealEstateParams>["setParams"]
type ListingLabels = {
  property: string
  listingType: string
  sale: string
  rent: string
  status: string
  statuses: Record<ListingRow["status"], string>
  price: string
  actions: string
  view: string
  edit: string
  notAvailable: string
}

export function getListingsColumns(
  setParams: SetParams,
  locale: string,
  labels: ListingLabels
): ColumnDef<ListingRow>[] {
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
            {categoryNames.get(row.original.propertyType) ??
              row.original.propertyType}
            {row.original.city ? ` · ${row.original.city}` : ""}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "listingType",
      header: labels.listingType,
      cell: ({ getValue }) =>
        getValue() === "sale" ? labels.sale : labels.rent,
    },
    {
      accessorKey: "status",
      header: labels.status,
      cell: ({ getValue }) => labels.statuses[getValue<ListingRow["status"]>()],
    },
    {
      id: "price",
      accessorFn: (row) => row.salePrice ?? row.monthlyRent,
      header: labels.price,
      cell: ({ row }) => {
        const price = row.original.salePrice ?? row.original.monthlyRent
        return price
          ? `${new Intl.NumberFormat(locale).format(Number(price))} ${row.original.currencyCode}`
          : labels.notAvailable
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
                listingId: row.original.id,
                listingMode: "details",
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
                listingId: row.original.id,
                listingMode: "edit",
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
