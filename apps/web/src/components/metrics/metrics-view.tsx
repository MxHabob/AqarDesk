"use client"

import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { updateMetricsSettingsAction } from "@/actions/update-metrics-settings-action"
import { BurnRateCard } from "./cards/burn-rate-card"
import { CashBalanceCard } from "./cards/cash-balance-card"
import { CategoryExpensesCard } from "./cards/category-expenses-card"
import { ExpensesCard } from "./cards/expenses-card"
import { MonthlyRevenueCard } from "./cards/monthly-revenue-card"
import { ProfitCard } from "./cards/profit-card"
import { RevenueForecastCard } from "./cards/revenue-forecast-card"
import { RunwayCard } from "./cards/runway-card"
import { useMetricsFilter } from "@/hooks/use-metrics-filter"
import { useUserQuery } from "@/hooks/use-user"
import { DraggableChartCard } from "./components/draggable-chart-card"
import { MetricsGrid } from "./components/metrics-grid"
import {
  type ChartId,
  type ChartLayoutItem,
  type ColSpan,
  DEFAULT_CHART_LAYOUT,
  DEFAULT_CHART_ORDER,
} from "./utils/chart-types"

const ORDERED_SPANS: ColSpan[] = [4, 6, 8, 12]

function closestSpan(n: number): ColSpan {
  let best: ColSpan = 4
  let bestDist = Math.abs(n - 4)
  for (const span of ORDERED_SPANS) {
    const distance = Math.abs(n - span)
    if (distance < bestDist) {
      best = span
      bestDist = distance
    }
  }
  return best
}

function largestSpanFitting(max: number): ColSpan {
  for (let index = ORDERED_SPANS.length - 1; index >= 0; index--) {
    const span = ORDERED_SPANS[index]!
    if (span <= max) return span
  }
  return 4
}

function fillRowGap(
  items: ChartLayoutItem[],
  start: number,
  end: number,
  rowTotal: number,
  protectedId?: ChartId
) {
  if (rowTotal >= 12) return
  const gap = 12 - rowTotal
  for (let index = end; index >= start; index--) {
    if (items[index]!.id !== protectedId) {
      items[index]!.colSpan = closestSpan(items[index]!.colSpan + gap)
      return
    }
  }
}

function normalizeRows(
  layout: ChartLayoutItem[],
  protectedId?: ChartId
): ChartLayoutItem[] {
  const result = layout.map((item) => ({ ...item }))
  let rowStart = 0
  let rowTotal = 0

  for (let index = 0; index < result.length; index++) {
    const item = result[index]!
    if (rowTotal + item.colSpan > 12) {
      const remaining = 12 - rowTotal
      if (remaining >= 4 && item.id !== protectedId) {
        item.colSpan = largestSpanFitting(remaining)
        rowTotal += item.colSpan
      } else {
        fillRowGap(result, rowStart, index - 1, rowTotal, protectedId)
        rowStart = index
        rowTotal = item.colSpan
      }
    } else {
      rowTotal += item.colSpan
    }

    if (rowTotal >= 12) {
      rowStart = index + 1
      rowTotal = 0
    }
  }

  fillRowGap(result, rowStart, result.length - 1, rowTotal, protectedId)
  return result
}

interface MetricsViewProps {
  initialLayout?: ChartLayoutItem[]
  isEditing?: boolean
}

export function MetricsView({
  initialLayout,
  isEditing = false,
}: MetricsViewProps) {
  const { data: user } = useUserQuery()
  const { from, to } = useMetricsFilter()
  const locale = user?.locale ?? undefined
  const [layout, setLayout] = useState<ChartLayoutItem[]>(
    initialLayout ?? DEFAULT_CHART_LAYOUT
  )

  const handleLayoutChange = useCallback((newLayout: ChartLayoutItem[]) => {
    const normalized = normalizeRows(newLayout)
    setLayout(normalized)
    updateMetricsSettingsAction(normalized)
  }, [])

  const handleResizeChart = useCallback(
    (chartId: ChartId, newColSpan: ColSpan) => {
      setLayout((prev) => {
        const updated = prev.map((item) =>
          item.id === chartId ? { ...item, colSpan: newColSpan } : item
        )
        const newLayout = normalizeRows(updated, chartId)
        updateMetricsSettingsAction(newLayout)
        return newLayout
      })
    },
    []
  )

  const gridRef = useRef<HTMLDivElement>(null)
  const normalizedLayout = useMemo(() => {
    const seen = new Set(layout.map((item) => item.id))
    const missing = DEFAULT_CHART_ORDER.filter((id) => !seen.has(id))
    const defaultSpans = new Map(
      DEFAULT_CHART_LAYOUT.map((item) => [item.id, item.colSpan])
    )
    return [
      ...layout,
      ...missing.map((id) => ({
        id,
        colSpan: defaultSpans.get(id) ?? 6,
      })),
    ]
  }, [layout])

  const renderChart = (chartId: ChartId, _index: number) => {
    const commonProps = {
      from,
      to,
      locale,
      isCustomizing: isEditing,
    }

    const chartContent = (() => {
      switch (chartId) {
        case "monthly-revenue":
          return <MonthlyRevenueCard {...commonProps} />
        case "burn-rate":
          return <BurnRateCard {...commonProps} />
        case "expenses":
          return <ExpensesCard {...commonProps} />
        case "profit":
          return <ProfitCard {...commonProps} />
        case "revenue-forecast":
          return <RevenueForecastCard {...commonProps} />
        case "runway":
          return <RunwayCard {...commonProps} />
        case "category-expenses":
          return <CategoryExpensesCard {...commonProps} />
        case "cash-balance":
          return (
            <CashBalanceCard
              from={from}
              to={to}
              locale={locale}
              isCustomizing={isEditing}
            />
          )
        default:
          return null
      }
    })()

    return (
      <DraggableChartCard
        key={chartId}
        id={chartId}
        isEditing={isEditing}
        onResize={(newColSpan) => handleResizeChart(chartId, newColSpan)}
      >
        {chartContent}
      </DraggableChartCard>
    )
  }

  const searchParams = useSearchParams()
  const scrollTo = searchParams.get("scrollTo")

  useEffect(() => {
    if (!scrollTo) return

    let attempts = 0
    const maxAttempts = 15
    const tryScroll = () => {
      const element = document.getElementById(scrollTo)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
        return
      }
      attempts++
      if (attempts < maxAttempts) setTimeout(tryScroll, 100)
    }

    tryScroll()
  }, [scrollTo])

  return (
    <div className="flex flex-col gap-6" ref={gridRef}>
      <MetricsGrid
        layout={normalizedLayout}
        onLayoutChange={handleLayoutChange}
        renderChart={renderChart}
        isEditing={isEditing}
      />
    </div>
  )
}
