import type { Metadata } from "next"
import { ErrorBoundary } from "next/dist/client/components/error-boundary"
import { Suspense } from "react"
import { CollapsibleSummary } from "@/components/collapsible-summary"
import { ErrorFallback } from "@/components/error-fallback"
import { ScrollableContent } from "@/components/scrollable-content"
import { ListingsTable } from "@/components/tables/listings"
import { ListingsSkeleton } from "@/components/tables/listings/skeleton"
import {
  RealEstateSummary,
  RealEstateSummarySkeleton,
} from "@/components/tables/real-estate-summary"
import { realEstateQueries } from "@/queries/real-estate"
import { getQueryClient, HydrateClient } from "@/queries/server"

export const metadata: Metadata = {
  title: "الإعلانات | AqarDesk",
}

export default async function ListingsPage() {
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(realEstateQueries.listings())

  return (
    <HydrateClient>
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <CollapsibleSummary>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
              <Suspense fallback={<RealEstateSummarySkeleton />}>
                <RealEstateSummary type="listings" />
              </Suspense>
            </div>
          </CollapsibleSummary>

          <ErrorBoundary errorComponent={ErrorFallback}>
            <Suspense fallback={<ListingsSkeleton />}>
              <ListingsTable />
            </Suspense>
          </ErrorBoundary>
        </div>
      </ScrollableContent>
    </HydrateClient>
  )
}
