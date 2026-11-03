"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/components/card"
import { Skeleton } from "@aqardesk/ui/components/skeleton"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getDashboardSummaryAction } from "@/actions/dashboard"
import { useI18n } from "@/locales/client"

type SummaryType = "properties" | "listings" | "owners"
type SummaryMetric = {
  label: string
  value: number
  accessible: boolean
}

export function RealEstateSummary({ type }: { type: SummaryType }) {
  const t = useI18n()
  const { data } = useSuspenseQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummaryAction,
  })
  const numberFormat = new Intl.NumberFormat()
  const metricGroups: Record<SummaryType, SummaryMetric[]> = {
    properties: [
      {
        label: t("realEstateDashboard.properties"),
        value: data.propertyCount,
        accessible: data.access.properties,
      },
      {
        label: t("realEstateDashboard.owners"),
        value: data.ownerCount,
        accessible: data.access.owners,
      },
      {
        label: t("realEstateDashboard.listings"),
        value: data.listingCount,
        accessible: data.access.listings,
      },
      {
        label: t("realEstateDashboard.activeListings"),
        value: data.activeListingCount,
        accessible: data.access.listings,
      },
    ],
    listings: [
      {
        label: t("realEstateDashboard.listings"),
        value: data.listingCount,
        accessible: data.access.listings,
      },
      {
        label: t("realEstateDashboard.activeListings"),
        value: data.activeListingCount,
        accessible: data.access.listings,
      },
      {
        label: t("realEstateDashboard.saleListings"),
        value: data.saleListingCount,
        accessible: data.access.listings,
      },
      {
        label: t("realEstateDashboard.rentalListings"),
        value: data.rentalListingCount,
        accessible: data.access.listings,
      },
    ],
    owners: [
      {
        label: t("realEstateDashboard.owners"),
        value: data.ownerCount,
        accessible: data.access.owners,
      },
      {
        label: t("realEstateDashboard.properties"),
        value: data.propertyCount,
        accessible: data.access.properties,
      },
      {
        label: t("realEstateDashboard.listings"),
        value: data.listingCount,
        accessible: data.access.listings,
      },
      {
        label: t("realEstateDashboard.activeListings"),
        value: data.activeListingCount,
        accessible: data.access.listings,
      },
    ],
  }
  const metrics = metricGroups[type]

  return (
    <>
      {metrics
        .filter((metric) => metric.accessible)
        .map(({ label, value }) => (
          <Card className="hidden sm:block" key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="font-medium text-2xl font-serif">
                {numberFormat.format(value)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              <span className="text-sm text-muted-foreground">{label}</span>
            </CardContent>
          </Card>
        ))}
    </>
  )
}

export function RealEstateSummarySkeleton() {
  return (
    <Card className="hidden sm:block">
      <CardHeader className="pb-2">
        <CardTitle className="font-medium text-2xl font-serif">
          <Skeleton className="h-[32px] w-24" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-5">
        <Skeleton className="h-[22px] w-32" />
      </CardContent>
    </Card>
  )
}
