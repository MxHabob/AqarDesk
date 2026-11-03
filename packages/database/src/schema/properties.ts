import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { users } from "./auth"
import { propertyFinishEnum, propertyTypeEnum, tenantTypeEnum } from "./enums"
import { owners } from "./owners"

export const properties = pgTable(
  "property",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: propertyTypeEnum("type").notNull(),
    title: text("title").notNull(),
    countryCode: text("country_code").notNull().default("SA"),
    description: text("description"),
    city: text("city"),
    district: text("district"),
    neighborhood: text("neighborhood"),
    address: text("address"),
    primaryStreet: text("primary_street"),
    secondaryStreet: text("secondary_street"),
    lotAreaM2: numeric("lot_area_m2", { precision: 12, scale: 2 }),
    frontageM: numeric("frontage_m", { precision: 9, scale: 2 }),
    depthM: numeric("depth_m", { precision: 9, scale: 2 }),
    buildingAreaM2: numeric("building_area_m2", {
      precision: 12,
      scale: 2,
    }),
    latitude: numeric("latitude", { precision: 9, scale: 6 }),
    longitude: numeric("longitude", { precision: 10, scale: 6 }),
    createdById: text("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => [
    index("property_type_idx").on(table.type),
    index("property_country_code_idx").on(table.countryCode),
    index("property_city_district_idx").on(table.city, table.district),
    index("property_neighborhood_idx").on(table.neighborhood),
    check(
      "property_country_code_format",
      sql`${table.countryCode} ~ '^[A-Z]{2}$'`
    ),
    check(
      "property_lot_area_nonnegative",
      sql`${table.lotAreaM2} is null or ${table.lotAreaM2} >= 0`
    ),
    check(
      "property_building_area_nonnegative",
      sql`${table.buildingAreaM2} is null or ${table.buildingAreaM2} >= 0`
    ),
    check(
      "property_frontage_nonnegative",
      sql`${table.frontageM} is null or ${table.frontageM} >= 0`
    ),
    check(
      "property_depth_nonnegative",
      sql`${table.depthM} is null or ${table.depthM} >= 0`
    ),
    check(
      "property_latitude_valid",
      sql`${table.latitude} is null or ${table.latitude} between -90 and 90`
    ),
    check(
      "property_longitude_valid",
      sql`${table.longitude} is null or ${table.longitude} between -180 and 180`
    ),
  ]
)

export const propertyOwners = pgTable(
  "property_owner",
  {
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => owners.id, { onDelete: "restrict" }),
    ownershipSharePercent: numeric("ownership_share_percent", {
      precision: 5,
      scale: 2,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("property_owner_pair_idx").on(table.propertyId, table.ownerId),
    index("property_owner_owner_id_idx").on(table.ownerId),
    check(
      "property_owner_share_valid",
      sql`${table.ownershipSharePercent} is null or ${table.ownershipSharePercent} between 0 and 100`
    ),
  ]
)

export const buildingDetails = pgTable(
  "building_details",
  {
    propertyId: uuid("property_id")
      .primaryKey()
      .references(() => properties.id, { onDelete: "cascade" }),
    currentFloors: integer("current_floors"),
    constructionDesign: text("construction_design"),
    deedIssuer: text("deed_issuer"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "building_current_floors_nonnegative",
      sql`${table.currentFloors} is null or ${table.currentFloors} >= 0`
    ),
  ]
)

export const landDetails = pgTable("land_details", {
  propertyId: uuid("property_id")
    .primaryKey()
    .references(() => properties.id, { onDelete: "cascade" }),
  deedIssuer: text("deed_issuer"),
})

export const houseVillaDetails = pgTable(
  "house_villa_details",
  {
    propertyId: uuid("property_id")
      .primaryKey()
      .references(() => properties.id, { onDelete: "cascade" }),
    currentFloors: integer("current_floors"),
    apartmentCount: integer("apartment_count"),
    constructionDesign: text("construction_design"),
    finish: propertyFinishEnum("finish"),
    hasYard: boolean("has_yard"),
    hasReception: boolean("has_reception"),
    isFurnished: boolean("is_furnished"),
    hasBasement: boolean("has_basement"),
    hasGuardRoom: boolean("has_guard_room"),
    deedIssuer: text("deed_issuer"),
  },
  (table) => [
    check(
      "house_villa_current_floors_nonnegative",
      sql`${table.currentFloors} is null or ${table.currentFloors} >= 0`
    ),
    check(
      "house_villa_apartment_count_nonnegative",
      sql`${table.apartmentCount} is null or ${table.apartmentCount} >= 0`
    ),
  ]
)

export const investmentDetails = pgTable("investment_details", {
  propertyId: uuid("property_id")
    .primaryKey()
    .references(() => properties.id, { onDelete: "cascade" }),
  investmentType: text("investment_type"),
  additionalDetails: text("additional_details"),
  finish: propertyFinishEnum("finish"),
  deedIssuer: text("deed_issuer"),
})

export const commercialDetails = pgTable(
  "commercial_details",
  {
    propertyId: uuid("property_id")
      .primaryKey()
      .references(() => properties.id, { onDelete: "cascade" }),
    previousActivity: text("previous_activity"),
    openingCount: integer("opening_count"),
    toiletCount: integer("toilet_count"),
    hasStorage: boolean("has_storage"),
    storageDetails: text("storage_details"),
    additionalDetails: text("additional_details"),
  },
  (table) => [
    check(
      "commercial_openings_nonnegative",
      sql`${table.openingCount} is null or ${table.openingCount} >= 0`
    ),
    check(
      "commercial_toilets_nonnegative",
      sql`${table.toiletCount} is null or ${table.toiletCount} >= 0`
    ),
  ]
)

export const warehouseDetails = pgTable(
  "warehouse_details",
  {
    propertyId: uuid("property_id")
      .primaryKey()
      .references(() => properties.id, { onDelete: "cascade" }),
    openingCount: integer("opening_count"),
    toiletCount: integer("toilet_count"),
    additionalDetails: text("additional_details"),
  },
  (table) => [
    check(
      "warehouse_openings_nonnegative",
      sql`${table.openingCount} is null or ${table.openingCount} >= 0`
    ),
    check(
      "warehouse_toilets_nonnegative",
      sql`${table.toiletCount} is null or ${table.toiletCount} >= 0`
    ),
  ]
)

export const yardDetails = pgTable("yard_details", {
  propertyId: uuid("property_id")
    .primaryKey()
    .references(() => properties.id, { onDelete: "cascade" }),
  requestedActivity: text("requested_activity"),
  hasFence: boolean("has_fence"),
  hasRoof: boolean("has_roof"),
  toiletCount: integer("toilet_count"),
  hasGuardRoom: boolean("has_guard_room"),
  additionalDetails: text("additional_details"),
})

export const apartmentDetails = pgTable(
  "apartment_details",
  {
    propertyId: uuid("property_id")
      .primaryKey()
      .references(() => properties.id, { onDelete: "cascade" }),
    roomCount: integer("room_count"),
    toiletCount: integer("toilet_count"),
    kitchenDetails: text("kitchen_details"),
    hasSeparateMajlis: boolean("has_separate_majlis"),
    entranceCount: integer("entrance_count"),
    floorNumber: text("floor_number"),
    hasYard: boolean("has_yard"),
    isFurnished: boolean("is_furnished"),
    buildingType: text("building_type"),
    preferredTenant: tenantTypeEnum("preferred_tenant"),
    additionalDetails: text("additional_details"),
  },
  (table) => [
    check(
      "apartment_rooms_nonnegative",
      sql`${table.roomCount} is null or ${table.roomCount} >= 0`
    ),
    check(
      "apartment_toilets_nonnegative",
      sql`${table.toiletCount} is null or ${table.toiletCount} >= 0`
    ),
    check(
      "apartment_entrances_nonnegative",
      sql`${table.entranceCount} is null or ${table.entranceCount} >= 0`
    ),
  ]
)
