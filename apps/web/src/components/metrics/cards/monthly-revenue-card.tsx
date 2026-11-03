"use client"

import { useMemo } from "react"
import { AnimatedNumber } from "@/components/animated-number"
import { formatChartMonth } from "@/components/charts/chart-utils"
import { MonthlyRevenueChart } from "@/components/charts/monthly-revenue-chart"
import { useRealEstateMetricsQuery } from "@/hooks/use-real-estate-metrics"
import { useI18n } from "@/locales/client"
import { ChartFadeIn } from "../components/chart-loading-overlay"
import { DragIndicator } from "../components/drag-indicator"

interface MonthlyRevenueCardProps {
  from: string
  to: string
  locale?: string
  isCustomizing?: boolean
}

export function MonthlyRevenueCard({
  from,
  to,
  locale,
  isCustomizing,
}: MonthlyRevenueCardProps) {
  const { data: metrics } = useRealEstateMetricsQuery(from, to)
  const t = useI18n()

  const monthlyRevenueChartData = useMemo(() => {
    const values = metrics?.properties.byMonth ?? []
    const previousValues = new Map(
      (metrics?.properties.previousByMonth ?? []).map((item) => [
        item.month,
        item.total,
      ])
    )
    const average = values.length
      ? values.reduce((sum, item) => sum + item.total, 0) / values.length
      : 0

    return values.map((item) => ({
      month: formatChartMonth(`${item.month}-01`, values.length),
      amount: item.total,
      lastYearAmount:
        previousValues.get(
          `${Number(item.month.slice(0, 4)) - 1}${item.month.slice(4)}`
        ) ?? 0,
      average,
      currentRevenue: item.total,
      lastYearRevenue:
        previousValues.get(
          `${Number(item.month.slice(0, 4)) - 1}${item.month.slice(4)}`
        ) ?? 0,
      averageRevenue: average,
    }))
  }, [metrics])

  const totalRevenue = metrics?.properties.total ?? 0

  return (
    <div className="border bg-background border-border p-6 flex flex-col h-full relative group">
      <div className="mb-4 min-h-[140px]">
        <div className="flex items-start justify-between h-7">
          <h3 className="text-sm font-normal text-muted-foreground">
            {t("metrics.propertiesCreatedOverTime")}
          </h3>
          <div
            className={
              isCustomizing
                ? "flex items-center gap-2"
                : "flex items-center gap-2 opacity-0 group-hover:opacity-100 group-has-[*[data-state=open]]:opacity-100 transition-opacity"
            }
          >
            {isCustomizing && <DragIndicator />}
          </div>
        </div>
        <p className="text-3xl font-normal mb-3">
          <AnimatedNumber
            value={totalRevenue}
            locale={locale}
            maximumFractionDigits={0}
          />
        </p>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 bg-foreground" />
            <span className="text-xs text-muted-foreground">
              {t("common.properties")}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <div
              className="w-2 h-2"
              style={{
                backgroundColor: "var(--chart-bar-fill-secondary)",
              }}
            />
            <span className="text-xs text-muted-foreground">Previous year</span>
          </div>
          <div className="flex gap-2 items-center">
            <div
              className="w-4 h-0.5"
              style={{
                borderTop: "2px dashed hsl(var(--muted-foreground))",
              }}
            />
            <span className="text-xs text-muted-foreground">Average</span>
          </div>
        </div>
      </div>
      <div className="h-80">
        {monthlyRevenueChartData.length > 0 ? (
          <ChartFadeIn>
            <MonthlyRevenueChart
              data={monthlyRevenueChartData}
              height={320}
              locale={locale}
            />
          </ChartFadeIn>
        ) : null}
      </div>
    </div>
  )
}
