"use client"

import { AnimatedNumber } from "@/components/animated-number"
import { RunwayChart } from "@/components/charts/runway-chart"
import { useRealEstateMetricsQuery } from "@/hooks/use-real-estate-metrics"
import { useI18n } from "@/locales/client"
import { ChartFadeIn } from "../components/chart-loading-overlay"
import { DragIndicator } from "../components/drag-indicator"

interface RunwayCardProps {
  from: string
  to: string
  locale?: string
  isCustomizing?: boolean
}

export function RunwayCard({
  from,
  to,
  locale,
  isCustomizing,
}: RunwayCardProps) {
  const { data: metrics, isPending } = useRealEstateMetricsQuery(from, to)
  const t = useI18n()
  const assigned = metrics?.listings.assignment.assigned ?? 0
  const unassigned = metrics?.listings.assignment.unassigned ?? 0
  const total = assigned + unassigned
  const runwayChartData = total
    ? [
        {
          month: t("metrics.assigned"),
          cashRemaining: assigned,
          burnRate: assigned,
          runwayMonths: assigned,
        },
        {
          month: t("metrics.unassigned"),
          cashRemaining: unassigned,
          burnRate: unassigned,
          runwayMonths: unassigned,
        },
      ]
    : []

  return (
    <div className="border bg-background border-border p-6 flex flex-col h-full relative group">
      <div className="mb-4 min-h-[140px]">
        <div className="flex items-start justify-between h-7">
          <h3 className="text-sm font-normal text-muted-foreground">
            {t("metrics.listingAssignment")}
          </h3>
          {isCustomizing && <DragIndicator />}
        </div>
        <p className="text-3xl font-normal">
          <AnimatedNumber
            value={assigned}
            locale={locale}
            maximumFractionDigits={0}
          />
        </p>
        <p className="text-xs mt-1 text-muted-foreground">
          {t("metrics.assigned")} / {t("metrics.unassigned")}
        </p>
      </div>
      <div className="h-80">
        {runwayChartData.length > 0 ? (
          <ChartFadeIn>
            <RunwayChart
              data={runwayChartData}
              height={320}
              locale={locale}
              displayMode="number"
            />
          </ChartFadeIn>
        ) : isPending ? null : (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground -mt-10">
            No listing assignment data available.
          </div>
        )}
      </div>
    </div>
  )
}
