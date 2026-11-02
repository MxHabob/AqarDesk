import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"
import { ListingFilters } from "@/components/listings/listing-filters"
import { ListingsTableView } from "@/components/listings/listings-table-view"
import { CreateListingButton } from "@/components/sheets/create-listing-sheet"
import { getScopedI18n, initializeLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  await initializeLocale(params)
  const t = await getScopedI18n("listings")
  return { title: t("title"), description: t("description") }
}

export default async function ListingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await initializeLocale(params)
  const t = await getScopedI18n("listings")

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} action={<CreateListingButton />} />
      <ListingFilters />
      <ListingsTableView />
    </div>
  )
}
