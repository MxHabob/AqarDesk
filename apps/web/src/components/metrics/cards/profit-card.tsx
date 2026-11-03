"use client"

import { format, parseISO } from "date-fns"
import { useMemo } from "react"
import { AnimatedNumber } from "@/components/animated-number"
import { ProfitChart } from "@/components/charts/profit-chart"
import type { PropertyType } from "@aqardesk/categories"
import { useRealEstateMetricsQuery } from "@/hooks/use-real-estate-metrics"
import { useI18n } from "@/locales/client"
import { ChartFadeIn } from "../components/chart-loading-overlay"
import { DragIndicator } from "../components/drag-indicator"

interface ProfitCardProps {
  from: string
  to: string
  locale?: string
  isCustomizing?: boolean
}

export function ProfitCard({
  from,
  to,
  locale,
  isCustomizing,
}: ProfitCardProps) {
  const { data: metrics } = useRealEstateMetricsQuery(from, to)
  const t = useI18n()
  const propertyTypes: Record<PropertyType, string> = {
    building: t("propertyTypes.building"),
    land: t("propertyTypes.land"),
    house_villa: t("propertyTypes.house_villa"),
    investment: t("propertyTypes.investment"),
    commercial: t("propertyTypes.commercial"),
    warehouse: t("propertyTypes.warehouse"),
    yard: t("propertyTypes.yard"),
    apartment: t("propertyTypes.apartment"),
  }

  const profitChartData = useMemo(() => {
    const values = metrics?.properties.byType ?? []
    const previousValues = new Map(
      (metrics?.properties.previousByType ?? []).map((item) => [
        item.type,
        item.total,
      ])
    )
    const average = values.length
      ? values.reduce((sum, item) => sum + item.total, 0) / values.length
      : 0

    return values.map((item) => ({
      month: propertyTypes[item.type],
      profit: item.total,
      lastYearProfit: previousValues.get(item.type) ?? 0,
      average,
    }))
  }, [metrics, propertyTypes])

  const totalProfit = metrics?.properties.total ?? 0

  const dateRangeDisplay = useMemo(() => {
    try {
      const fromDate = parseISO(from)
      const toDate = parseISO(to)
      return `${format(fromDate, "MMM d")} - ${format(toDate, "MMM d, yyyy")}`
    } catch {
      return ""
    }
  }, [from, to])

  return (
    <div className="border bg-background border-border p-6 flex flex-col h-full relative group">
      <div className="mb-4 min-h-[140px]">
        <div className="flex items-start justify-between h-7">
          <h3 className="text-sm font-normal text-muted-foreground">
            {t("metrics.propertiesByType")}
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
        <p className="text-3xl font-normal">
          <AnimatedNumber
            value={totalProfit}
            locale={locale}
            maximumFractionDigits={0}
          />
        </p>
        <p className="text-xs mt-1 text-muted-foreground">{dateRangeDisplay}</p>
      </div>
      <div className="h-80">
        {profitChartData.length > 0 ? (
          <ChartFadeIn>
            <ProfitChart data={profitChartData} height={320} locale={locale} />
          </ChartFadeIn>
        ) : null}
      </div>
    </div>
  )
}
