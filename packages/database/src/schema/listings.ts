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
  uuid,
} from "drizzle-orm/pg-core"

import { users } from "./auth"
import { listingSourceEnum, listingStatusEnum, listingTypeEnum } from "./enums"
import { properties } from "./properties"

export const listings = pgTable(
  "listing",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "restrict" }),
    type: listingTypeEnum("type").notNull(),
    status: listingStatusEnum("status").notNull().default("draft"),
    salePrice: numeric("sale_price", { precision: 14, scale: 2 }),
    monthlyRent: numeric("monthly_rent", { precision: 14, scale: 2 }),
    keyMoney: numeric("key_money", { precision: 14, scale: 2 }),
    advanceAmount: numeric("advance_amount", { precision: 14, scale: 2 }),
    expectedMonthlyIncome: numeric("expected_monthly_income", {
      precision: 14,
      scale: 2,
    }),
    currencyCode: text("currency_code").notNull(),
    leaseDurationMonths: integer("lease_duration_months"),
    source: listingSourceEnum("source").notNull().default("office"),
    sourceContactName: text("source_contact_name"),
    sourceContactPhone: text("source_contact_phone"),
    handledByOffice: boolean("handled_by_office").notNull().default(true),
    publicNotes: text("public_notes"),
    internalNotes: text("internal_notes"),
    createdById: text("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    assignedToId: text("assigned_to_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (table) => [
    index("listing_property_id_idx").on(table.propertyId),
    index("listing_browse_idx").on(table.status, table.type, table.createdAt),
    index("listing_assigned_to_idx").on(table.assignedToId, table.status),
    index("listing_sale_price_idx")
      .on(table.salePrice)
      .where(sql`${table.salePrice} is not null`),
    index("listing_monthly_rent_idx")
      .on(table.monthlyRent)
      .where(sql`${table.monthlyRent} is not null`),
    check(
      "listing_sale_price_nonnegative",
      sql`${table.salePrice} is null or ${table.salePrice} >= 0`
    ),
    check(
      "listing_monthly_rent_nonnegative",
      sql`${table.monthlyRent} is null or ${table.monthlyRent} >= 0`
    ),
    check(
      "listing_key_money_nonnegative",
      sql`${table.keyMoney} is null or ${table.keyMoney} >= 0`
    ),
    check(
      "listing_advance_amount_nonnegative",
      sql`${table.advanceAmount} is null or ${table.advanceAmount} >= 0`
    ),
    check(
      "listing_income_nonnegative",
      sql`${table.expectedMonthlyIncome} is null or ${table.expectedMonthlyIncome} >= 0`
    ),
    check(
      "listing_lease_duration_positive",
      sql`${table.leaseDurationMonths} is null or ${table.leaseDurationMonths} > 0`
    ),
    check(
      "listing_active_has_price",
      sql`${table.status} not in ('active', 'reserved') or (${table.type} = 'sale' and ${table.salePrice} is not null) or (${table.type} = 'rent' and ${table.monthlyRent} is not null)`
    ),
    check(
      "listing_price_matches_type",
      sql`(${table.type} = 'sale' and ${table.monthlyRent} is null and ${table.keyMoney} is null and ${table.advanceAmount} is null and ${table.leaseDurationMonths} is null) or (${table.type} = 'rent' and ${table.salePrice} is null)`
    ),
    check(
      "listing_status_matches_type",
      sql`(${table.type} = 'sale' and ${table.status} <> 'rented') or (${table.type} = 'rent' and ${table.status} <> 'sold')`
    ),
    check(
      "listing_currency_code_format",
      sql`${table.currencyCode} ~ '^[A-Z]{3}$'`
    ),
  ]
)

export const listingPriceHistory = pgTable(
  "listing_price_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    salePrice: numeric("sale_price", { precision: 14, scale: 2 }),
    monthlyRent: numeric("monthly_rent", { precision: 14, scale: 2 }),
    changedById: text("changed_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    changedAt: timestamp("changed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("listing_price_history_listing_idx").on(table.listingId)]
)

export const listingStatusHistory = pgTable(
  "listing_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    status: listingStatusEnum("status").notNull(),
    changedById: text("changed_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    note: text("note"),
    changedAt: timestamp("changed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("listing_status_history_listing_idx").on(table.listingId)]
)
