"use client"

import { format, parseISO } from "date-fns"
import { useMemo } from "react"
import { AnimatedNumber } from "@/components/animated-number"
import { RevenueForecastChart } from "@/components/charts/revenue-forecast-chart"
import { useRealEstateMetricsQuery } from "@/hooks/use-real-estate-metrics"
import { useI18n } from "@/locales/client"
import { ChartFadeIn } from "../components/chart-loading-overlay"
import { DragIndicator } from "../components/drag-indicator"

interface RevenueForecastCardProps {
  from: string
  to: string
  locale?: string
  isCustomizing?: boolean
}

export function RevenueForecastCard({
  from,
  to,
  locale,
  isCustomizing,
}: RevenueForecastCardProps) {
  const { data: metrics } = useRealEstateMetricsQuery(from, to)
  const t = useI18n()
  const revenueForecastChartData = useMemo(() => {
    return (metrics?.properties.byCity ?? []).map((item) => ({
      month: item.city,
      actual: item.total,
      forecasted: null,
      optimistic: null,
      pessimistic: null,
      confidence: null,
      breakdown: null,
    }))
  }, [metrics])

  const forecastedRevenue = metrics?.properties.total ?? 0

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
            {t("metrics.propertiesByCity")}
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
        <p className="text-3xl font-normal">
          <AnimatedNumber
            value={forecastedRevenue}
            locale={locale}
            maximumFractionDigits={0}
          />
        </p>
        <p className="text-xs mt-1 text-muted-foreground">{dateRangeDisplay}</p>
        <div className="flex gap-4 items-center mt-2">
          <div className="flex gap-2 items-center">
            <div className="w-4 h-0.5 bg-foreground" />
            <span className="text-xs text-muted-foreground">
              {t("common.properties")}
            </span>
          </div>
        </div>
      </div>
      <div className="h-80">
        {revenueForecastChartData.length > 0 ? (
          <ChartFadeIn>
            <RevenueForecastChart
              data={revenueForecastChartData}
              height={320}
              locale={locale}
              forecastStartIndex={-1}
            />
          </ChartFadeIn>
        ) : null}
      </div>
    </div>
  )
}
