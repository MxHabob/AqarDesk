"use client"

import type { PropertyFieldSetting, PropertyType } from "@aqardesk/categories"
import {
  FavoritesProvider,
  useFavorites,
} from "@/components/marketing/favorites-provider"
import type {
  Listing,
  ListingCardLabels,
} from "@/components/marketing/listing-card"
import { ListingCard } from "@/components/marketing/listing-card"
import type { ListingPhoto } from "@/components/marketing/listing-photo-carousel"

type Props = {
  listings: Listing[]
  photos: Record<string, ListingPhoto[]>
  favoriteIds: string[]
  fieldSettings: Record<string, Record<string, PropertyFieldSetting>>
  propertyTypeLabels: Record<PropertyType, string>
  locale: string
  labels: ListingCardLabels
  emptyLabel: string
  googleEnabled: boolean
  emailOtpEnabled: boolean
}

function FavoriteCards({
  listings,
  photos,
  fieldSettings,
  propertyTypeLabels,
  locale,
  labels,
  emptyLabel,
}: Omit<Props, "favoriteIds" | "googleEnabled" | "emailOtpEnabled">) {
  const { isFavorite } = useFavorites()
  const favoriteListings = listings.filter((listing) => isFavorite(listing.id))

  if (favoriteListings.length === 0) {
    return (
      <p className="rounded-lg border border-border p-5 text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }

  return (
    <ul className="grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
      {favoriteListings.map((listing) => (
        <li key={listing.id} className="min-w-0">
          <ListingCard
            listing={listing}
            returnTo={`/account/favorites#listing-${listing.id}`}
            coverPhoto={photos[listing.id]?.[0]}
            photos={photos[listing.id]}
            fieldSettings={fieldSettings}
            propertyTypeLabel={propertyTypeLabels[listing.propertyType]}
            locale={locale}
            labels={labels}
          />
        </li>
      ))}
    </ul>
  )
}

export function FavoriteListingsGrid({
  favoriteIds,
  googleEnabled,
  emailOtpEnabled,
  ...gridProps
}: Props) {
  return (
    <FavoritesProvider
      authenticated
      favoriteListingIds={favoriteIds}
      googleEnabled={googleEnabled}
      emailOtpEnabled={emailOtpEnabled}
    >
      <FavoriteCards {...gridProps} />
    </FavoritesProvider>
  )
}
