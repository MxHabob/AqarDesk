"use client"

import { Button } from "@aqardesk/ui/components/button"
import { Input } from "@aqardesk/ui/components/input"

export function PropertiesTableHeader({
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
          <h1 className="text-2xl font-semibold">العقارات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة العقارات ومواصفاتها والملاك.
          </p>
        </div>
        <Button type="button" onClick={onCreate}>
          إضافة عقار
        </Button>
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
