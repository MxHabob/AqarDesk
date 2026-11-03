"use client"

import { Button } from "@aqardesk/ui/components/button"
import { Input } from "@aqardesk/ui/components/input"
import Link from "next/link"

export function ListingsTableHeader({
  searchValue,
  onSearchChange,
  onCreate,
}: {
  searchValue: string
  onSearchChange: (value: string) => void
  onCreate: () => void
}) {
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">الإعلانات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            متابعة إعلانات البيع والإيجار وحالاتها.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/properties?createProperty=true"
            className="inline-flex h-9 items-center border border-border px-3 text-xs font-semibold tracking-widest uppercase transition-colors hover:bg-muted"
          >
            إضافة عقار
          </Link>
          <Button type="button" onClick={onCreate}>
            إنشاء إعلان
          </Button>
        </div>
      </header>
      <Input
        aria-label="ابحث باسم العقار أو المدينة"
        autoComplete="off"
        placeholder="ابحث باسم العقار أو المدينة..."
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>
  )
}
