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

export const propertyCategories = [
  {
    type: "building",
    nameAr: "عمائر",
    nameEn: "Buildings",
  },
  {
    type: "land",
    nameAr: "أراضٍ",
    nameEn: "Land",
  },
  {
    type: "house_villa",
    nameAr: "بيوت وفلل",
    nameEn: "Houses and villas",
  },
  {
    type: "investment",
    nameAr: "أراضٍ ومبانٍ استثمارية",
    nameEn: "Investment properties",
  },
  {
    type: "commercial",
    nameAr: "محلات تجارية",
    nameEn: "Commercial properties",
  },
  {
    type: "warehouse",
    nameAr: "مخازن",
    nameEn: "Warehouses",
  },
  {
    type: "yard",
    nameAr: "أراضٍ وأحواش",
    nameEn: "Land and yards",
  },
  {
    type: "apartment",
    nameAr: "شقق",
    nameEn: "Apartments",
  },
] as const satisfies readonly PropertyCategory[]

export function getPropertyCategory(type: PropertyType) {
  const category = propertyCategories.find((item) => item.type === type)

  if (!category) {
    throw new RangeError(`Unknown property category: ${type}`)
  }

  return category
}

export function getPropertyCategoryLabel(
  type: PropertyType,
  listingType?: ListingType
) {
  const category = getPropertyCategory(type)

  if (!listingType) {
    return category.nameAr
  }

  return `${category.nameAr} ${listingType === "sale" ? "للبيع" : "للإيجار"}`
}
