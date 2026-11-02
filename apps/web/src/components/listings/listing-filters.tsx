"use client"

import { propertyTypeValues } from "@aqardesk/categories"
import { Input } from "@aqardesk/ui/components/input"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { useScopedI18n } from "@/locales/client"

const listingFiltersParser = {
  q: parseAsString.withDefault(""),
  propertyType: parseAsString.withDefault(""),
  listingType: parseAsString.withDefault(""),
  status: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(25),
  sortBy: parseAsString.withDefault("createdAt"),
  sortOrder: parseAsString.withDefault("desc"),
}

export function useListingQueryState() {
  return useQueryStates(listingFiltersParser, {
    history: "replace",
    clearOnDefault: true,
  })
}

export function ListingFilters() {
  const t = useScopedI18n("listings")
  const types = useScopedI18n("propertyTypes")
  const [filters, setFilters] = useListingQueryState()

  return (
    <div className="flex flex-wrap gap-3">
      <Input
        aria-label={t("searchPlaceholder")}
        placeholder={t("searchPlaceholder")}
        value={filters.q}
        className="w-full sm:max-w-xs"
        onChange={(event) => setFilters({ q: event.target.value, page: 1 })}
      />
      <select
        aria-label={t("propertyType")}
        className="h-10 min-w-40 border border-input bg-background px-3 text-sm"
        value={filters.propertyType}
        onChange={(event) =>
          setFilters({ propertyType: event.target.value, page: 1 })
        }
      >
        <option value="">{t("selectType")}</option>
        {propertyTypeValues.map((type) => (
          <option key={type} value={type}>
            {types(type)}
          </option>
        ))}
      </select>
      <select
        aria-label={t("listingType")}
        className="h-10 min-w-36 border border-input bg-background px-3 text-sm"
        value={filters.listingType}
        onChange={(event) =>
          setFilters({ listingType: event.target.value, page: 1 })
        }
      >
        <option value="">{t("selectOffer")}</option>
        <option value="sale">{t("sale")}</option>
        <option value="rent">{t("rent")}</option>
      </select>
      <select
        aria-label={t("status")}
        className="h-10 min-w-36 border border-input bg-background px-3 text-sm"
        value={filters.status}
        onChange={(event) =>
          setFilters({ status: event.target.value, page: 1 })
        }
      >
        <option value="">{t("selectStatus")}</option>
        <option value="draft">{t("statusDraft")}</option>
        <option value="active">{t("statusActive")}</option>
        <option value="reserved">{t("statusReserved")}</option>
        <option value="sold">{t("statusSold")}</option>
        <option value="rented">{t("statusRented")}</option>
        <option value="expired">{t("statusExpired")}</option>
        <option value="withdrawn">{t("statusWithdrawn")}</option>
      </select>
    </div>
  )
}
