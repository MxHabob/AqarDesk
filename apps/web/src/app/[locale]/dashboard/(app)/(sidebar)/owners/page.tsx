import type { Metadata } from "next"
import { ErrorBoundary } from "next/dist/client/components/error-boundary"
import { Suspense } from "react"
import { CollapsibleSummary } from "@/components/collapsible-summary"
import { ErrorFallback } from "@/components/error-fallback"
import { ScrollableContent } from "@/components/scrollable-content"
import { OwnersTable } from "@/components/tables/owners"
import { OwnersSkeleton } from "@/components/tables/owners/skeleton"
import {
  RealEstateSummary,
  RealEstateSummarySkeleton,
} from "@/components/tables/real-estate-summary"
import { realEstateQueries } from "@/queries/real-estate"
import { getQueryClient, HydrateClient } from "@/queries/server"
import { getInitialTableSettings } from "@/utils/columns"

export const metadata: Metadata = {
  title: "الملاك | AqarDesk",
}

export default async function OwnersPage() {
  const queryClient = getQueryClient()
  const [_, initialSettings] = await Promise.all([
    queryClient.prefetchQuery(realEstateQueries.owners()),
    getInitialTableSettings("owners"),
  ])

  return (
    <HydrateClient>
      <ScrollableContent className="flex h-[calc(100dvh-86px)] min-h-0 flex-col overflow-hidden">
        <div className="flex h-full min-h-0 flex-col gap-6">
          <CollapsibleSummary className="shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
              <Suspense fallback={<RealEstateSummarySkeleton />}>
                <RealEstateSummary type="owners" />
              </Suspense>
            </div>
          </CollapsibleSummary>

          <div className="flex min-h-0 flex-1">
            <ErrorBoundary errorComponent={ErrorFallback}>
              <Suspense fallback={<OwnersSkeleton />}>
                <OwnersTable initialSettings={initialSettings} />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </ScrollableContent>
    </HydrateClient>
  )
}
