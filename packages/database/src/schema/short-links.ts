import { sql } from "drizzle-orm"
import {
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { users } from "./auth"

export const shortLinks = pgTable(
  "short_link",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id").notNull(),
    tokenHash: text("token_hash").notNull(),
    createdById: text("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("short_link_token_hash_unique_idx").on(table.tokenHash),
    index("short_link_resource_created_idx").on(
      table.resourceType,
      table.resourceId,
      table.createdAt
    ),
    index("short_link_expiration_idx").on(table.expiresAt, table.revokedAt),
    check(
      "short_link_resource_type_format",
      sql`${table.resourceType} ~ '^[a-z][a-z0-9_]{0,63}$'`
    ),
    check(
      "short_link_resource_id_length",
      sql`length(${table.resourceId}) between 1 and 200`
    ),
  ]
)
