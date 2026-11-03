import { redirectLegacyDashboardRoute } from "@/lib/redirect-legacy-dashboard-route"

export default async function TransactionsRedirectPage(
  props: PageProps<"/[locale]/dashboard/transactions">
) {
  await redirectLegacyDashboardRoute({
    ...props,
    destination: "properties",
  })
}
