"use client"

import { useQuery } from "@tanstack/react-query"
import { realEstateMetricsQueryOptions } from "@/queries/real-estate-metrics"

export function useRealEstateMetricsQuery(from: string, to: string) {
  return useQuery(realEstateMetricsQueryOptions({ from, to }))
}
