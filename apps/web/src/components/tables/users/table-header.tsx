"use client"

import { Button } from "@aqardesk/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@aqardesk/ui/components/dropdown-menu"
import { Input } from "@aqardesk/ui/components/input"
import type { Table } from "@tanstack/react-table"
import { Columns3 } from "lucide-react"
import type { ManagedUser } from "@/components/forms/user-form"
import { useScopedI18n } from "@/locales/client"

export function UsersTableHeader({
  query,
  locale,
  table,
  onCreate,
}: {
  query: string
  locale: string
  table: Table<ManagedUser>
  onCreate: () => void
}) {
  const t = useScopedI18n("accessManagement")
  const common = useScopedI18n("common")
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide())

  return (
    <div className="shrink-0">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("usersTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("usersDescription")}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <form
            action={`/${locale}/dashboard/users`}
            method="get"
            className="flex min-w-0 flex-1 gap-2 sm:w-auto"
          >
            <Input
              name="q"
              defaultValue={query}
              placeholder={t("searchUsers")}
              aria-label={t("searchUsers")}
              className="h-9 min-w-0 sm:w-64"
            />
            <Button type="submit" variant="outline" size="sm">
              {t("search")}
            </Button>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={common("columns")}
                  title={common("columns")}
                />
              }
            >
              <Columns3 aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{common("columns")}</DropdownMenuLabel>
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(checked) =>
                    column.toggleVisibility(checked)
                  }
                  onSelect={(event) => event.preventDefault()}
                >
                  {typeof column.columnDef.header === "string"
                    ? column.columnDef.header
                    : column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="button" onClick={onCreate}>
            {t("createUser")}
          </Button>
        </div>
      </header>
    </div>
  )
}
