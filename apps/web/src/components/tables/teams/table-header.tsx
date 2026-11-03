"use client"

import type { RouterOutputs } from "@api/trpc/routers/_app"
import { Button } from "@aqardesk/ui/button"
import { Input } from "@aqardesk/ui/input"
import type { Table } from "@tanstack/react-table"
import Link from "next/link"

type Props = {
  table?: Table<RouterOutputs["team"]["list"][number]>
}

export function DataTableHeader({ table }: Props) {
  return (
    <div className="flex items-center pb-4 gap-x-4">
      <Input
        className="flex-1"
        placeholder="Search..."
        value={(table?.getColumn("team")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table?.getColumn("team")?.setFilterValue(event.target.value)
        }
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
      />
      <Link href="/onboarding">
        <Button>Create team</Button>
      </Link>
    </div>
  )
}
