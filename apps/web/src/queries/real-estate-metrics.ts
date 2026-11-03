import { queryOptions } from "@tanstack/react-query"
import { getRealEstateMetricsAction } from "@/actions/real-estate-metrics"

export type RealEstateMetrics = Awaited<
  ReturnType<typeof getRealEstateMetricsAction>
>

export function realEstateMetricsQueryOptions(input: {
  from: string
  to: string
}) {
  return queryOptions({
    queryKey: ["real-estate-metrics", input.from, input.to],
    queryFn: () => getRealEstateMetricsAction(input),
  })
}
