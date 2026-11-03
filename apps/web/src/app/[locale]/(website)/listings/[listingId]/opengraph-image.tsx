import { ImageResponse } from "next/og"
import { z } from "zod"
import {
  getPublicListingById,
  getPublicListingCoverPhotos,
} from "@/lib/listings/public-queries"

export const alt = "AqarDesk real estate listing"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const revalidate = 300

type Props = {
  params: Promise<{ listingId: string; locale: string }>
}

const listingIdSchema = z.uuid()

export default async function OpenGraphImage({ params }: Props) {
  const { listingId, locale } = await params
  if (!listingIdSchema.safeParse(listingId).success) {
    return new Response("Not found", { status: 404 })
  }

  const listing = await getPublicListingById(listingId)
  if (!listing) {
    return new Response("Not found", { status: 404 })
  }

  const coverPhotos = await getPublicListingCoverPhotos([listing.id])
  const photo = coverPhotos[listing.id]
  const cover =
    photo &&
    ["image/jpeg", "image/png", "image/webp"].includes(photo.contentType ?? "")
      ? photo
      : undefined
  const price =
    listing.listingType === "sale" ? listing.salePrice : listing.monthlyRent
  const formattedPrice =
    price === null
      ? ""
      : `${new Intl.NumberFormat(locale === "ar" ? "en-US" : locale, {
          maximumFractionDigits: 0,
        }).format(Number(price))} ${listing.currencyCode}`
  const location = [listing.neighborhood, listing.district, listing.city]
    .filter((value): value is string => Boolean(value))
    .join(" · ")
  const imageTitle = /^[\x20-\x7e]*$/.test(listing.title)
    ? listing.title.slice(0, 90)
    : "PROPERTY LISTING"
  const imageLocation = /^[\x20-\x7e]*$/.test(location) ? location : ""

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "#f7f7f5",
        color: "#171717",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          width: cover ? "52%" : "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              backgroundColor: "#171717",
            }}
          />
          <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: 1 }}>
            AQARDESK
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <span
            style={{
              display: "flex",
              fontSize: 50,
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            {imageTitle}
          </span>
          {imageLocation && (
            <span style={{ color: "#686868", fontSize: 24 }}>
              {imageLocation}
            </span>
          )}
          {formattedPrice && (
            <span style={{ fontSize: 32, fontWeight: 500 }}>
              {formattedPrice}
            </span>
          )}
        </div>
        <span style={{ color: "#686868", fontSize: 18 }}>
          {listing.listingType === "sale" ? "FOR SALE" : "FOR RENT"}
        </span>
      </div>
      {cover && (
        // biome-ignore lint/performance/noImgElement: ImageResponse rasterizes this signed remote photo.
        <img
          src={cover.url}
          alt=""
          width={576}
          height={630}
          style={{ width: "48%", height: "100%", objectFit: "cover" }}
        />
      )}
    </div>,
    size
  )
}
