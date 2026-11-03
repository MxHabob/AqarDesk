import { redirectLegacyDashboardRoute } from "@/lib/redirect-legacy-dashboard-route"

export default async function CustomersRedirectPage(
  props: PageProps<"/[locale]/dashboard/customers">
) {
  await redirectLegacyDashboardRoute({
    ...props,
    destination: "owners",
  })
}
