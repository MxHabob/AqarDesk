import { Button } from "@aqardesk/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/components/card"
import { formatCurrency } from "@aqardesk/utils"
import Link from "next/link"

type ListingCardProps = {
  listing: {
    id: string
    type: "sale" | "rent"
    salePrice: string | null
    monthlyRent: string | null
    currencyCode: string
    title: string
    propertyType: string
    city: string | null
    district: string | null
  }
  locale: string
  propertyTypeLabel: string
  detailsLabel: string
}

export function ListingCard({
  listing,
  locale,
  propertyTypeLabel,
  detailsLabel,
}: ListingCardProps) {
  const price =
    listing.type === "sale" ? listing.salePrice : listing.monthlyRent
  const location = [listing.city, listing.district]
    .filter(Boolean)
    .join(locale === "ar" ? "، " : ", ")

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardDescription>{propertyTypeLabel}</CardDescription>
        <CardTitle>{listing.title}</CardTitle>
        <CardDescription>{location}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex items-center justify-between gap-3">
        <span className="text-sm font-medium">
          {price !== null &&
            formatCurrency(price, listing.currencyCode, {
              locale,
              options: { maximumFractionDigits: 0 },
            })}
        </span>
        <Button
          size="sm"
          variant="outline"
          render={<Link href={`/p/${listing.id}`} />}
        >
          {detailsLabel}
        </Button>
      </CardContent>
    </Card>
  )
}
