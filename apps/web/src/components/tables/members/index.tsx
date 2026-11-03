"use client"

import { Button } from "@aqardesk/ui/button"
import { cn } from "@aqardesk/ui/cn"
import { Dialog } from "@aqardesk/ui/dialog"
import { Input } from "@aqardesk/ui/input"
import { Table, TableBody, TableCell, TableRow } from "@aqardesk/ui/table"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"
import { InviteTeamMembersModal } from "@/components/modals/invite-team-members-modal"
import { useUserQuery } from "@/hooks/use-user"
import { useTRPC } from "@/trpc/client"
import { columns } from "./columns"

export function DataTable() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const trpc = useTRPC()
  const [isOpen, onOpenChange] = useState(false)
  const { data: user } = useUserQuery()
  const { data } = useSuspenseQuery({
    ...trpc.team.members.queryOptions(),
  })

  const table = useReactTable({
    getRowId: (row) => row.id,
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
    meta: {
      currentUser: data?.find((member) => member?.user?.id === user?.id),
      totalOwners: data?.filter((member) => member?.role === "owner").length,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center pb-4 gap-x-4">
        <Input
          className="flex-1"
          placeholder="Search..."
          value={(table.getColumn("user")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("user")?.setFilterValue(event.target.value)
          }
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
        />
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <Button onClick={() => onOpenChange(true)}>Invite member</Button>
          <InviteTeamMembersModal onOpenChange={onOpenChange} />
        </Dialog>
      </div>
      <Table>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-transparent"
              >
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "border-e-[0px] py-4",
                      cell.column.columnDef.meta?.className
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
