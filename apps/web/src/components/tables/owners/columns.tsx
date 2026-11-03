"use client"

import type { listOwners } from "@aqardesk/database/queries"
import { Button } from "@aqardesk/ui/components/button"
import type { ColumnDef } from "@tanstack/react-table"
import type { useRealEstateParams } from "@/hooks/use-real-estate-params"

export type OwnerRow = Awaited<ReturnType<typeof listOwners>>[number]

type SetParams = ReturnType<typeof useRealEstateParams>["setParams"]

export function getOwnersColumns(setParams: SetParams): ColumnDef<OwnerRow>[] {
  return [
    {
      accessorKey: "name",
      header: "المالك",
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "notes",
      header: "ملاحظات داخلية",
      cell: ({ getValue }) => getValue<string | null>() || "—",
    },
    {
      accessorKey: "createdAt",
      header: "تاريخ الإضافة",
      cell: ({ getValue }) =>
        new Intl.DateTimeFormat("ar-SA", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(getValue<Date>()),
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
              setParams({ ownerId: row.original.id, ownerMode: "details" })
            }
          >
            عرض
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() =>
              setParams({ ownerId: row.original.id, ownerMode: "edit" })
            }
          >
            تعديل
          </Button>
        </div>
      ),
    },
  ]
}
