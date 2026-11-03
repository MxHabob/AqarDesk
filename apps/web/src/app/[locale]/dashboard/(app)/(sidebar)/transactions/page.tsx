import type { Metadata } from "next"
import { ErrorBoundary } from "next/dist/client/components/error-boundary"
import { Suspense } from "react"
import { ErrorFallback } from "@/components/error-fallback"
import { ScrollableContent } from "@/components/scrollable-content"
import { PropertiesTable } from "@/components/tables/properties"
import { PropertiesSkeleton } from "@/components/tables/properties/skeleton"
import { realEstateQueries } from "@/queries/real-estate"
import { getQueryClient, HydrateClient } from "@/trpc/server"

export const metadata: Metadata = {
  title: "العقارات | AqarDesk",
}

export default async function PropertiesPage() {
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(realEstateQueries.properties())

  return (
    <HydrateClient>
      <ScrollableContent>
        <ErrorBoundary errorComponent={ErrorFallback}>
          <Suspense fallback={<PropertiesSkeleton />}>
            <PropertiesTable />
          </Suspense>
        </ErrorBoundary>
      </ScrollableContent>
    </HydrateClient>
  )
}
