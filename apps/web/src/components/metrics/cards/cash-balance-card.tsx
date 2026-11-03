"use client"

import { useMemo } from "react"
import { AnimatedNumber } from "@/components/animated-number"
import {
  CashBalanceDonutChart,
  grayShades,
} from "@/components/charts/cash-balance-donut-chart"
import { useRealEstateMetricsQuery } from "@/hooks/use-real-estate-metrics"
import { useI18n } from "@/locales/client"
import { ChartFadeIn } from "../components/chart-loading-overlay"
import { DragIndicator } from "../components/drag-indicator"

interface CashBalanceCardProps {
  from: string
  to: string
  locale?: string
  isCustomizing?: boolean
}

export function CashBalanceCard({
  from,
  to,
  locale,
  isCustomizing,
}: CashBalanceCardProps) {
  const { data, isPending } = useRealEstateMetricsQuery(from, to)
  const t = useI18n()
  const total = data?.properties.ownershipCoverage.total ?? 0
  const owned = data?.properties.ownershipCoverage.owned ?? 0
  const unowned = Math.max(0, total - owned)

  const donutData = useMemo(() => {
    return [
      { name: t("metrics.withOwner"), amount: owned },
      { name: t("metrics.withoutOwner"), amount: unowned },
    ]
      .filter((item) => item.amount > 0)
      .map((item) => ({
        ...item,
        percentage: total > 0 ? (item.amount / total) * 100 : 0,
      }))
  }, [owned, t, total, unowned])

  return (
    <div className="border bg-background border-border p-6 flex flex-col h-full relative group">
      <div className="mb-4 min-h-[140px]">
        <div className="flex items-start justify-between h-7">
          <h3 className="text-sm font-normal text-muted-foreground">
            {t("metrics.propertyOwnership")}
          </h3>
          {isCustomizing && (
            <div>
              <DragIndicator />
            </div>
          )}
        </div>
        <p className="text-3xl font-normal">
          <AnimatedNumber
            value={total}
            locale={locale}
            maximumFractionDigits={0}
          />
        </p>
        {donutData.length > 0 && (
          <div className="flex gap-4 items-center mt-2 flex-wrap">
            {donutData.slice(0, 3).map((item, idx) => (
              <div key={item.name} className="flex gap-2 items-center">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: grayShades[idx % grayShades.length],
                  }}
                />
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="h-80">
        {donutData.length > 0 ? (
          <ChartFadeIn>
            <CashBalanceDonutChart
              data={donutData}
              height={320}
              locale={locale}
            />
          </ChartFadeIn>
        ) : isPending ? null : (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground -mt-10">
            No property ownership data available.
          </div>
        )}
      </div>
    </div>
  )
}
