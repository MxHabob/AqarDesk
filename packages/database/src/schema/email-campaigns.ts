import { sql } from "drizzle-orm"
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { listings } from "./listings"

export const emailCampaigns = pgTable(
  "email_campaign",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .unique()
      .references(() => listings.id, { onDelete: "cascade" }),
    propertyTitle: text("property_title").notNull(),
    listingType: text("listing_type").notNull(),
    price: text("price").notNull(),
    currencyCode: text("currency_code").notNull(),
    status: text("status").notNull().default("pending"),
    lastRecipientUserId: text("last_recipient_user_id"),
    attempts: integer("attempts").notNull().default(0),
    availableAt: timestamp("available_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("email_campaign_pending_idx").on(table.status, table.availableAt),
    check(
      "email_campaign_listing_type_valid",
      sql`${table.listingType} in ('sale', 'rent')`
    ),
    check(
      "email_campaign_status_valid",
      sql`${table.status} in ('pending', 'processing', 'completed', 'failed')`
    ),
    check(
      "email_campaign_currency_code_valid",
      sql`${table.currencyCode} ~ '^[A-Z]{3}$'`
    ),
    check("email_campaign_attempts_nonnegative", sql`${table.attempts} >= 0`),
  ]
)
