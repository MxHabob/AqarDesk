import { propertyCategories } from "./categories"
import type { ListingType, PropertyType } from "./types"

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
