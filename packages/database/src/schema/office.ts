import { sql } from "drizzle-orm"
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { users } from "./auth"

export const officeSettings = pgTable(
  "office_settings",
  {
    id: text("id").primaryKey().default("default"),
    name: text("name").notNull().default("عقار دِسك"),
    logoUrl: text("logo_url"),
    email: text("email"),
    phone: text("phone"),
    website: text("website"),
    address: text("address"),
    city: text("city"),
    region: text("region"),
    postalCode: text("postal_code"),
    countryCode: text("country_code").notNull().default("SA"),
    defaultCurrency: text("default_currency").notNull().default("SAR"),
    timezone: text("timezone").notNull().default("Asia/Riyadh"),
    fiscalYearStartMonth: integer("fiscal_year_start_month")
      .notNull()
      .default(1),
    updatedById: text("updated_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("office_settings_singleton_id", sql`${table.id} = 'default'`),
    check(
      "office_settings_currency_format",
      sql`${table.defaultCurrency} ~ '^[A-Z]{3}$'`
    ),
    check(
      "office_settings_fiscal_year_month_valid",
      sql`${table.fiscalYearStartMonth} between 1 and 12`
    ),
  ]
)

export const teams = pgTable(
  "team",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
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
    uniqueIndex("team_name_unique_idx").on(table.name),
    index("team_archived_at_idx").on(table.archivedAt),
  ]
)

export const teamMembers = pgTable(
  "team_member",
  {
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    assignedById: text("assigned_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.teamId, table.userId] }),
    index("team_member_user_id_idx").on(table.userId),
    uniqueIndex("team_member_single_lead_idx")
      .on(table.teamId)
      .where(sql`${table.role} = 'lead'`),
    check("team_member_role_valid", sql`${table.role} in ('lead', 'member')`),
  ]
)

export const auditLogs = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: text("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    actorName: text("actor_name"),
    actorEmail: text("actor_email"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    before: jsonb("before").$type<Record<string, unknown>>(),
    after: jsonb("after").$type<Record<string, unknown>>(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_log_created_at_idx").on(table.createdAt),
    index("audit_log_actor_created_idx").on(table.actorId, table.createdAt),
    index("audit_log_entity_created_idx").on(
      table.entityType,
      table.entityId,
      table.createdAt
    ),
  ]
)
