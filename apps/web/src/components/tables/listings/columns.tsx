"use client"

import { propertyCategories } from "@aqardesk/categories"
import type { listListings } from "@aqardesk/database/queries"
import { Button } from "@aqardesk/ui/components/button"
import { Checkbox } from "@aqardesk/ui/components/checkbox"
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
  selectAll: string
  selectRow: string
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
      size: 150,
      minSize: 120,
      cell: ({ getValue }) =>
        getValue() === "sale" ? labels.sale : labels.rent,
    },
    {
      accessorKey: "status",
      header: labels.status,
      size: 170,
      minSize: 130,
      cell: ({ getValue }) => labels.statuses[getValue<ListingRow["status"]>()],
    },
    {
      id: "price",
      accessorFn: (row) => row.salePrice ?? row.monthlyRent,
      header: labels.price,
      size: 190,
      minSize: 150,
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
                listingId: row.original.id,
                listingMode: "details",
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
                listingId: row.original.id,
                listingMode: "edit",
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
