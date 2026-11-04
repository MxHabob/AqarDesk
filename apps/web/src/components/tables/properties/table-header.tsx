"use client"

import { propertyCategories } from "@aqardesk/categories"
import { Button } from "@aqardesk/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@aqardesk/ui/components/dropdown-menu"
import { Input } from "@aqardesk/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aqardesk/ui/components/select"
import type { Table } from "@tanstack/react-table"
import { Columns3 } from "lucide-react"
import { useCurrentLocale, useI18n } from "@/locales/client"

export function PropertiesTableHeader<TData>({
  searchValue,
  onSearchChange,
  onCreate,
  table,
  propertyTypeFilter,
  onPropertyTypeFilterChange,
}: {
  searchValue: string
  onSearchChange: (value: string) => void
  onCreate: () => void
  table: Table<TData>
  propertyTypeFilter: string | null
  onPropertyTypeFilterChange: (value: string | null) => void
}) {
  const locale = useCurrentLocale()
  const t = useI18n()
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide())

  return (
    <div className="shrink-0">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("common.properties")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("realEstateTables.propertiesDescription")}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Input
            className="h-9 min-w-0 flex-1 sm:w-64 sm:flex-none"
            aria-label={t("realEstateTables.searchProperties")}
            autoComplete="off"
            placeholder={`${t("realEstateTables.searchProperties")}...`}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <Select
            value={propertyTypeFilter ?? "all"}
            onValueChange={(value) =>
              onPropertyTypeFilterChange(value === "all" ? null : value)
            }
          >
            <SelectTrigger
              className="h-9 w-auto min-w-40"
              aria-label={t("realEstateTables.filterPropertyType")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("realEstateTables.allPropertyTypes")}
              </SelectItem>
              {propertyCategories.map((category) => (
                <SelectItem key={category.type} value={category.type}>
                  {locale === "ar" ? category.nameAr : category.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={t("common.columns")}
                  title={t("common.columns")}
                />
              }
            >
              <Columns3 aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{t("common.columns")}</DropdownMenuLabel>
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
            {t("realEstateTables.addProperty")}
          </Button>
        </div>
      </header>
    </div>
  )
}
