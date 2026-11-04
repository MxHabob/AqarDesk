import type { PropertyCategory } from "./types"
import type { ListingType, PropertyType } from "./types"

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

export const listingTypesByPropertyType: Record<
  PropertyType,
  readonly ListingType[]
> = {
  building: ["sale"],
  land: ["sale"],
  house_villa: ["sale", "rent"],
  investment: ["rent"],
  commercial: ["rent"],
  warehouse: ["rent"],
  yard: ["rent"],
  apartment: ["rent"],
}
