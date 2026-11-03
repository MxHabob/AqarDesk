"use client"

import { Icons } from "@aqardesk/ui/icons"
import { AnimatedNumber } from "@/components/animated-number"
import { StackedBarChart } from "@/components/charts/stacked-bar-chart"
import { useRealEstateMetricsQuery } from "@/hooks/use-real-estate-metrics"
import { useI18n } from "@/locales/client"
import { ChartFadeIn } from "../components/chart-loading-overlay"
import { DragIndicator } from "../components/drag-indicator"

interface ExpensesCardProps {
  from: string
  to: string
  locale?: string
  isCustomizing?: boolean
}

export function ExpensesCard({
  from,
  to,
  locale,
  isCustomizing,
}: ExpensesCardProps) {
  const { data: metrics, isPending } = useRealEstateMetricsQuery(from, to)
  const t = useI18n()
  const listingStatus = metrics?.listings.byStatus ?? []
  const statusLabels: Record<string, string> = {
    draft: t("realEstateTables.statusDraft"),
    active: t("realEstateTables.statusActive"),
    reserved: t("realEstateTables.statusReserved"),
    sold: t("realEstateTables.statusSold"),
    rented: t("realEstateTables.statusRented"),
    expired: t("realEstateTables.statusExpired"),
    withdrawn: t("realEstateTables.statusWithdrawn"),
  }
  const totalListings = listingStatus.reduce((sum, item) => sum + item.total, 0)
  const averageListings = listingStatus.length
    ? totalListings / listingStatus.length
    : 0
  const expenseData = {
    result: listingStatus.map((item) => ({
      date: statusLabels[item.status] ?? item.status,
      value: item.total,
      recurring: 0,
      total: item.total,
    })),
  }
  const hasExpenseData = expenseData.result.length > 0

  return (
    <div className="border bg-background border-border p-6 flex flex-col h-full relative group">
      <div className="mb-4 min-h-[140px]">
        <div className="flex items-start justify-between h-7">
          <h3 className="text-sm font-normal text-muted-foreground">
            {t("metrics.listingsByStatus")}
          </h3>
          <div
            className={
              isCustomizing
                ? ""
                : "opacity-0 group-hover:opacity-100 group-has-[*[data-state=open]]:opacity-100 transition-opacity"
            }
          >
            {isCustomizing && <DragIndicator />}
          </div>
        </div>
        <p className="text-3xl font-normal mb-3">
          <AnimatedNumber
            value={averageListings}
            locale={locale}
            maximumFractionDigits={0}
          />
        </p>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 rounded-full bg-[#C6C6C6] dark:bg-[#606060]" />
            <span className="text-xs text-muted-foreground">
              {t("common.listings")}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 flex items-center justify-center">
              <Icons.DotRaster />
            </div>
            <span className="text-xs text-muted-foreground">
              {t("realEstateTables.status")}
            </span>
          </div>
        </div>
      </div>
      <div className="h-80">
        {hasExpenseData ? (
          <ChartFadeIn>
            <StackedBarChart data={expenseData} height={320} />
          </ChartFadeIn>
        ) : isPending ? null : (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground -mt-10">
            No listing status data available.
          </div>
        )}
      </div>
    </div>
  )
}
