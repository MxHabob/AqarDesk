"use client"

import { Button } from "@aqardesk/ui/components/button"
import { Input } from "@aqardesk/ui/components/input"

export function OwnersTableHeader({
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
          <h1 className="text-2xl font-semibold">الملاك</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة بيانات الملاك وأرقام التواصل الخاصة بهم.
          </p>
        </div>
        <Button type="button" onClick={onCreate}>
          إضافة مالك
        </Button>
      </header>
      <Input
        aria-label="ابحث باسم المالك"
        autoComplete="off"
        placeholder="ابحث باسم المالك..."
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>
  )
}
