import type { Metadata } from "next"
import { OverviewView } from "@/components/widgets"
import { getDashboardSummaryAction } from "@/actions/dashboard"
import { getQueryClient, HydrateClient } from "@/queries/server"

export const metadata: Metadata = {
  title: "Overview | AqarDesk",
}

export default async function Overview() {
  const queryClient = getQueryClient()
  void queryClient.prefetchQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummaryAction,
  })

  return (
    <HydrateClient>
      <OverviewView />
    </HydrateClient>
  )
}
