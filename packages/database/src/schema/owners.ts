import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { users } from "./auth"

export const owners = pgTable(
  "owner",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    offerTypes: text("offer_types")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    buildingType: text("building_type"),
    city: text("city"),
    district: text("district"),
    neighborhood: text("neighborhood"),
    street: text("street"),
    contactViaOffice: boolean("contact_via_office").notNull().default(true),
    notes: text("notes"),
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
    index("owner_name_idx").on(table.name),
    check(
      "owner_offer_types_valid",
      sql`${table.offerTypes} <@ array['sale', 'rent']::text[]`
    ),
  ]
)

export const ownerPhones = pgTable(
  "owner_phone",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => owners.id, { onDelete: "cascade" }),
    phoneNumber: text("phone_number").notNull(),
    label: text("label"),
    isWhatsapp: boolean("is_whatsapp").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("owner_phone_owner_id_idx").on(table.ownerId),
    uniqueIndex("owner_phone_unique_idx").on(table.ownerId, table.phoneNumber),
  ]
)
