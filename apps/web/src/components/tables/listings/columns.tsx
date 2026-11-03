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

const categoryNames = new Map(
  propertyCategories.map((category) => [category.type, category.nameAr])
)

const statusNames: Record<ListingRow["status"], string> = {
  draft: "مسودة",
  active: "نشط",
  reserved: "محجوز",
  sold: "مباع",
  rented: "مؤجر",
  expired: "منتهي",
  withdrawn: "مسحوب",
}

export function getListingsColumns(
  setParams: SetParams
): ColumnDef<ListingRow>[] {
  return [
    {
      accessorKey: "title",
      header: "العقار",
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
      header: "نوع الإعلان",
      cell: ({ getValue }) => (getValue() === "sale" ? "بيع" : "إيجار"),
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ getValue }) => statusNames[getValue<ListingRow["status"]>()],
    },
    {
      id: "price",
      accessorFn: (row) => row.salePrice ?? row.monthlyRent,
      header: "السعر",
      cell: ({ row }) => {
        const price = row.original.salePrice ?? row.original.monthlyRent
        return price
          ? `${new Intl.NumberFormat("ar-SA").format(Number(price))} ${row.original.currencyCode}`
          : "—"
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
                listingId: row.original.id,
                listingMode: "details",
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
                listingId: row.original.id,
                listingMode: "edit",
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
