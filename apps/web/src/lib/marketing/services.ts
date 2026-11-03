export const marketingServices = [
  {
    slug: "sale",
    copyKey: "sale",
    listingType: "sale",
    propertyType: undefined,
  },
  {
    slug: "rent",
    copyKey: "rent",
    listingType: "rent",
    propertyType: undefined,
  },
  {
    slug: "investment",
    copyKey: "investment",
    listingType: "sale",
    propertyType: "investment",
  },
  {
    slug: "property-management",
    copyKey: "propertyManagement",
    listingType: null,
    propertyType: undefined,
  },
  {
    slug: "property-marketing",
    copyKey: "propertyMarketing",
    listingType: null,
    propertyType: undefined,
  },
  {
    slug: "property-consultation",
    copyKey: "propertyConsultation",
    listingType: null,
    propertyType: undefined,
  },
] as const

export type MarketingService = (typeof marketingServices)[number]

export function getMarketingService(slug: string) {
  return marketingServices.find((service) => service.slug === slug)
}
