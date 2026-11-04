"use client"

import { Button } from "@aqardesk/ui/components/button"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ArrowUpRight, Plus } from "lucide-react"
import Link from "next/link"
import { getDashboardSummaryAction } from "@/actions/dashboard"
import { useCurrentLocale, useI18n } from "@/locales/client"

interface WidgetCardProps {
  label: string
  href: string
  value: string
  detail?: string
}

function WidgetCard({ label, href, value, detail }: WidgetCardProps) {
  return (
    <Link
      href={href}
      className="h-full border p-5 flex flex-col justify-between transition-all duration-300 bg-white border-[#e6e6e6] hover:bg-[#f7f7f7] hover:border-[#d0d0d0] dark:bg-[#0c0c0c] dark:border-[#1d1d1d] dark:hover:bg-[#0f0f0f] dark:hover:border-[#222222] cursor-pointer group min-h-[110px]"
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-3">
        <span className="text-xl font-medium">{value}</span>
        {detail ? (
          <span className="text-xs text-muted-foreground ms-2">{detail}</span>
        ) : null}
      </div>
    </Link>
  )
}

export function WidgetCards() {
  const locale = useCurrentLocale()
  const t = useI18n()
  const { data } = useSuspenseQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummaryAction,
  })
  const numberFormat = new Intl.NumberFormat(locale)
  const access = data.access
  const statusLabels = {
    draft: t("realEstateTables.statusDraft"),
    active: t("realEstateTables.statusActive"),
    reserved: t("realEstateTables.statusReserved"),
    sold: t("realEstateTables.statusSold"),
    rented: t("realEstateTables.statusRented"),
    expired: t("realEstateTables.statusExpired"),
    withdrawn: t("realEstateTables.statusWithdrawn"),
  }

  return (
    <div className="w-full space-y-8">
      {(access.canCreateProperties ||
        access.canCreateListings ||
        access.canCreateOwners) && (
        <section aria-labelledby="dashboard-quick-actions">
          <h2
            id="dashboard-quick-actions"
            className="mb-3 text-start text-sm font-medium"
          >
            {t("realEstateDashboard.quickActions")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {access.canCreateListings && (
              <Button
                render={
                  <Link
                    href={`/${locale}/dashboard/listings?createListing=true`}
                  />
                }
              >
                <Plus aria-hidden="true" />
                {t("realEstateDashboard.createListing")}
              </Button>
            )}
            {access.canCreateProperties && (
              <Button
                variant="outline"
                render={
                  <Link
                    href={`/${locale}/dashboard/properties?createProperty=true`}
                  />
                }
              >
                <Plus aria-hidden="true" />
                {t("realEstateDashboard.createProperty")}
              </Button>
            )}
            {access.canCreateOwners && (
              <Button
                variant="outline"
                render={
                  <Link href={`/${locale}/dashboard/owners?createOwner=true`} />
                }
              >
                <Plus aria-hidden="true" />
                {t("realEstateDashboard.createOwner")}
              </Button>
            )}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {access.properties && (
          <WidgetCard
            label={t("realEstateDashboard.properties")}
            href={`/${locale}/dashboard/properties`}
            value={numberFormat.format(data.propertyCount)}
          />
        )}
        {access.listings && (
          <>
            <WidgetCard
              label={t("realEstateDashboard.listings")}
              href={`/${locale}/dashboard/listings`}
              value={numberFormat.format(data.listingCount)}
            />
            <WidgetCard
              label={t("realEstateDashboard.activeListings")}
              href={`/${locale}/dashboard/listings?listingStatus=active`}
              value={numberFormat.format(data.activeListingCount)}
            />
            <WidgetCard
              label={t("realEstateDashboard.saleListings")}
              href={`/${locale}/dashboard/listings?listingStatus=active&listingTypeFilter=sale`}
              value={numberFormat.format(data.saleListingCount)}
            />
            <WidgetCard
              label={t("realEstateDashboard.rentalListings")}
              href={`/${locale}/dashboard/listings?listingStatus=active&listingTypeFilter=rent`}
              value={numberFormat.format(data.rentalListingCount)}
            />
            <WidgetCard
              label={t("realEstateDashboard.draftListings")}
              href={`/${locale}/dashboard/listings?listingStatus=draft`}
              value={numberFormat.format(data.draftListingCount)}
            />
          </>
        )}
        {access.owners && (
          <WidgetCard
            label={t("realEstateDashboard.owners")}
            href={`/${locale}/dashboard/owners`}
            value={numberFormat.format(data.ownerCount)}
          />
        )}
      </div>

      {access.listings && (
        <section aria-labelledby="dashboard-recent-listings">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2
              id="dashboard-recent-listings"
              className="text-start text-sm font-medium"
            >
              {t("realEstateDashboard.recentListings")}
            </h2>
            <Link
              href={`/${locale}/dashboard/listings`}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {t("realEstateDashboard.viewAll")}
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
          <div className="divide-y border-y border-border">
            {data.recentListings.length === 0 ? (
              <p className="py-5 text-sm text-muted-foreground">
                {t("realEstateDashboard.noRecentListings")}
              </p>
            ) : (
              data.recentListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/${locale}/dashboard/listings?listingId=${listing.id}&listingMode=details`}
                  className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {listing.title}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {listing.city ?? t("common.notAvailable")} ·{" "}
                      {statusLabels[listing.status]}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm tabular-nums">
                    {(listing.salePrice ?? listing.monthlyRent)
                      ? `${new Intl.NumberFormat(locale).format(
                          Number(listing.salePrice ?? listing.monthlyRent)
                        )} ${listing.currencyCode}`
                      : t("common.notAvailable")}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  )
}
