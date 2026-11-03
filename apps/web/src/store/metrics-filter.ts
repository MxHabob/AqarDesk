"use client"

import { create } from "zustand"
import type { PeriodOption } from "@/utils/metrics-date-utils"

const STORAGE_KEY_BASE = "metrics-filter-preferences"

const getStorageKey = (officeId: string) => `${STORAGE_KEY_BASE}-${officeId}`

interface StoredPreferences {
  period: PeriodOption
  customFrom?: string
  customTo?: string
}

interface MetricsFilterState {
  period: PeriodOption
  customFrom?: string
  customTo?: string
  isReady: boolean
  officeId?: string
  setPeriod: (period: PeriodOption) => void
  setDateRange: (from: string, to: string) => void
  initialize: (officeId: string) => void
}

function readPreferences(officeId: string): StoredPreferences | null {
  try {
    const stored = localStorage.getItem(getStorageKey(officeId))
    return stored ? (JSON.parse(stored) as StoredPreferences) : null
  } catch {
    return null
  }
}

function persistPreferences(
  officeId: string | undefined,
  preferences: StoredPreferences
) {
  if (!officeId) return

  try {
    localStorage.setItem(getStorageKey(officeId), JSON.stringify(preferences))
  } catch {
    // Browser storage may be unavailable.
  }
}

export const useMetricsFilterStore = create<MetricsFilterState>()(
  (set, get) => ({
    period: "1-year",
    isReady: false,

    setPeriod: (period) => {
      const state = get()
      const preferences = {
        period,
        customFrom: state.customFrom,
        customTo: state.customTo,
      }
      persistPreferences(state.officeId, preferences)
      set({ period })
    },

    setDateRange: (customFrom, customTo) => {
      const state = get()
      const preferences = { period: "custom" as const, customFrom, customTo }
      persistPreferences(state.officeId, preferences)
      set(preferences)
    },

    initialize: (officeId) => {
      if (get().officeId === officeId && get().isReady) return

      const stored = readPreferences(officeId)
      set({
        officeId,
        period: stored?.period ?? "1-year",
        customFrom: stored?.customFrom,
        customTo: stored?.customTo,
        isReady: true,
      })
    },
  })
)
