"use client"

import { useQueryStates } from "nuqs"
import { parseAsString } from "nuqs/server"
import { useEffect, useMemo } from "react"
import { useOfficeSettingsQuery } from "@/hooks/use-office-settings"
import { useMetricsFilterStore } from "@/store/metrics-filter"
import {
  getPeriodDateRange,
  type PeriodOption,
} from "@/utils/metrics-date-utils"

const DEFAULT_PERIOD: PeriodOption = "1-year"

export const metricsFilterSchema = {
  period: parseAsString.withDefault(DEFAULT_PERIOD),
  from: parseAsString,
  to: parseAsString,
}

function isPeriodOption(
  value: string | null | undefined
): value is PeriodOption {
  return (
    value !== null &&
    value !== undefined &&
    [
      "3-months",
      "6-months",
      "this-year",
      "1-year",
      "2-years",
      "5-years",
      "fiscal-year",
      "custom",
    ].includes(value)
  )
}

export function useMetricsFilter() {
  const { data: officeSettings } = useOfficeSettingsQuery()
  const fiscalYearStartMonth = officeSettings.fiscalYearStartMonth
  const store = useMetricsFilterStore()
  const [params, setParams] = useQueryStates(metricsFilterSchema, {
    clearOnDefault: true,
  })

  useEffect(() => {
    store.initialize(officeSettings.id)
  }, [officeSettings.id, store.initialize])

  const isAtDefaults =
    params.period === DEFAULT_PERIOD && !params.from && !params.to

  const period =
    store.isReady && isAtDefaults
      ? store.period
      : isPeriodOption(params.period)
        ? params.period
        : DEFAULT_PERIOD

  const dateRange = useMemo(() => {
    if (params.from && params.to) {
      return { from: params.from, to: params.to }
    }

    if (period === "custom" && store.customFrom && store.customTo) {
      return { from: store.customFrom, to: store.customTo }
    }

    return getPeriodDateRange(period, fiscalYearStartMonth)
  }, [
    fiscalYearStartMonth,
    params.from,
    params.to,
    period,
    store.customFrom,
    store.customTo,
  ])

  useEffect(() => {
    if (store.isReady && !isAtDefaults && isPeriodOption(params.period)) {
      store.setPeriod(params.period)
      if (params.from && params.to) {
        store.setDateRange(params.from, params.to)
      }
    }
  }, [
    isAtDefaults,
    params.from,
    params.period,
    params.to,
    store.isReady,
    store.setDateRange,
    store.setPeriod,
  ])

  const updatePeriod = (nextPeriod: PeriodOption) => {
    store.setPeriod(nextPeriod)
    if (nextPeriod === "custom" && params.from && params.to) {
      setParams({ period: nextPeriod })
      return
    }

    const nextRange = getPeriodDateRange(nextPeriod, fiscalYearStartMonth)
    setParams({ period: nextPeriod, from: nextRange.from, to: nextRange.to })
  }

  const updateDateRange = (from: string, to: string) => {
    store.setDateRange(from, to)
    setParams({ period: "custom", from, to })
  }

  return {
    period,
    from: dateRange.from,
    to: dateRange.to,
    updatePeriod,
    updateDateRange,
  }
}
