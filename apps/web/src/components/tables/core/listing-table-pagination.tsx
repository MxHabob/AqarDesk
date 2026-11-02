"use client"

import { Button } from "@aqardesk/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aqardesk/ui/components/select"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"

export function ListingTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}) {
  const t = useScopedI18n("common")
  const listings = useScopedI18n("listings")
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const locale = useCurrentLocale()
  const pageLabel = `${t("page")} ${new Intl.NumberFormat(locale).format(page)} ${t("of")} ${new Intl.NumberFormat(locale).format(pageCount)}`

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">
        {new Intl.NumberFormat(locale).format(total)} {listings("totalCount")}
      </p>
      <div className="flex items-center gap-3">
        <span className="hidden text-muted-foreground sm:inline">
          {t("rowsPerPage")}
        </span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            if (value) onPageSizeChange(Number(value))
          }}
        >
          <SelectTrigger className="w-20" aria-label={t("rowsPerPage")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50, 100].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="min-w-24 text-center">{pageLabel}</span>
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {t("previous")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          {t("next")}
        </Button>
      </div>
    </div>
  )
}
