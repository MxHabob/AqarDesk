"use client"

import {
  parseAsBoolean,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs"

export function useRealEstateParams() {
  const [params, setParams] = useQueryStates({
    createProperty: parseAsBoolean,
    propertyId: parseAsString,
    propertyMode: parseAsStringEnum(["edit", "details"]),
    createListing: parseAsBoolean,
    listingId: parseAsString,
    listingMode: parseAsStringEnum(["edit", "details"]),
    createOwner: parseAsBoolean,
    ownerId: parseAsString,
    ownerMode: parseAsStringEnum(["edit", "details"]),
    listingStatus: parseAsStringEnum([
      "draft",
      "active",
      "reserved",
      "sold",
      "rented",
      "expired",
      "withdrawn",
    ]),
    listingTypeFilter: parseAsStringEnum(["sale", "rent"]),
    propertyTypeFilter: parseAsStringEnum([
      "building",
      "land",
      "house_villa",
      "investment",
      "commercial",
      "warehouse",
      "yard",
      "apartment",
    ]),
  })

  return { ...params, setParams }
}
