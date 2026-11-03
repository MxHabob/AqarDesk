import type { Metadata } from "next"
import { ErrorBoundary } from "next/dist/client/components/error-boundary"
import { Suspense } from "react"
import { ErrorFallback } from "@/components/error-fallback"
import { ScrollableContent } from "@/components/scrollable-content"
import { PropertiesTable } from "@/components/tables/properties"
import { PropertiesSkeleton } from "@/components/tables/properties/skeleton"
import { realEstateQueries } from "@/queries/real-estate"
import { getQueryClient, HydrateClient } from "@/queries/server"
import { getInitialTableSettings } from "@/utils/columns"

export const metadata: Metadata = {
  title: "العقارات | AqarDesk",
}

export default async function PropertiesPage() {
  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(realEstateQueries.properties())
  const initialSettings = await getInitialTableSettings("properties")

  return (
    <HydrateClient>
      <ScrollableContent className="flex h-[calc(100dvh-86px)] min-h-0 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1">
          <ErrorBoundary errorComponent={ErrorFallback}>
            <Suspense fallback={<PropertiesSkeleton />}>
              <PropertiesTable initialSettings={initialSettings} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </ScrollableContent>
    </HydrateClient>
  )
}
