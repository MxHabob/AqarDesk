import { pgEnum } from "drizzle-orm/pg-core"

export const propertyTypeEnum = pgEnum("property_type", [
  "building",
  "land",
  "house_villa",
  "investment",
  "commercial",
  "warehouse",
  "yard",
  "apartment",
])

export const listingTypeEnum = pgEnum("listing_type", ["sale", "rent"])

export const listingStatusEnum = pgEnum("listing_status", [
  "draft",
  "active",
  "reserved",
  "sold",
  "rented",
  "expired",
  "withdrawn",
])

export const listingSourceEnum = pgEnum("listing_source", [
  "office",
  "owner_direct",
  "external_broker",
  "referral",
  "other",
])

export const mediaTypeEnum = pgEnum("media_type", [
  "photo",
  "floor_plan",
  "video",
  "document",
])

export const tenantTypeEnum = pgEnum("tenant_type", [
  "family",
  "office",
  "bachelors",
  "other",
])

export const propertyFinishEnum = pgEnum("property_finish", [
  "unfinished",
  "basic",
  "good",
  "excellent",
  "luxury",
  "other",
])
