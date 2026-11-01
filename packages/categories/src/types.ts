export const propertyTypeValues = [
  "building",
  "land",
  "house_villa",
  "investment",
  "commercial",
  "warehouse",
  "yard",
  "apartment",
] as const

export type PropertyType = (typeof propertyTypeValues)[number]
export type ListingType = "sale" | "rent"

export interface PropertyCategory {
  type: PropertyType
  nameAr: string
  nameEn: string
}
