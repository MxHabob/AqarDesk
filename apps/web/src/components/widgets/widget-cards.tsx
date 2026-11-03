"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import Link from "next/link"
import { getDashboardSummaryAction } from "@/actions/dashboard"
import { useI18n } from "@/locales/client"

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
  const t = useI18n()
  const { data } = useSuspenseQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummaryAction,
  })
  const numberFormat = new Intl.NumberFormat()
  const access = data.access

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
      {access.properties && (
        <WidgetCard
          label={t("realEstateDashboard.properties")}
          href="#"
          value={numberFormat.format(data.propertyCount)}
        />
      )}
      {access.listings && (
        <>
          <WidgetCard
            label={t("realEstateDashboard.listings")}
            href="#"
            value={numberFormat.format(data.listingCount)}
          />
          <WidgetCard
            label={t("realEstateDashboard.activeListings")}
            href="#"
            value={numberFormat.format(data.activeListingCount)}
          />
          <WidgetCard
            label={t("realEstateDashboard.saleListings")}
            href="#"
            value={numberFormat.format(data.saleListingCount)}
          />
          <WidgetCard
            label={t("realEstateDashboard.rentalListings")}
            href="#"
            value={numberFormat.format(data.rentalListingCount)}
          />
        </>
      )}
      {access.owners && (
        <WidgetCard
          label={t("realEstateDashboard.owners")}
          href="#"
          value={numberFormat.format(data.ownerCount)}
        />
      )}
    </div>
  )
}
