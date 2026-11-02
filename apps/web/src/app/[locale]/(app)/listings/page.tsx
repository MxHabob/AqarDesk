import type { Metadata } from "next"

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
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <CreateListingButton />
      </header>
      <ListingFilters />
      <ListingsTableView />
    </div>
  )
}
