import { redirectLegacyDashboardRoute } from "@/lib/redirect-legacy-dashboard-route"

export default async function InvoicesRedirectPage(
  props: PageProps<"/[locale]/dashboard/invoices">
) {
  await redirectLegacyDashboardRoute({
    ...props,
    destination: "listings",
  })
}
