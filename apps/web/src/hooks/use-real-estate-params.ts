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
  })

  return { ...params, setParams }
}
