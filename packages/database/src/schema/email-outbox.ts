import { sql } from "drizzle-orm"
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { users } from "./auth"

export const emailOutbox = pgTable(
  "email_outbox",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    dedupeKey: text("dedupe_key").notNull().unique(),
    recipientUserId: text("recipient_user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    recipientEmail: text("recipient_email").notNull(),
    category: text("category").notNull(),
    subject: text("subject").notNull(),
    html: text("html").notNull(),
    text: text("text").notNull(),
    headers: jsonb("headers").$type<Record<string, string>>(),
    status: text("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    availableAt: timestamp("available_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    providerMessageId: text("provider_message_id"),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("email_outbox_pending_idx").on(
      table.status,
      table.availableAt,
      table.createdAt
    ),
    index("email_outbox_recipient_idx").on(
      table.recipientUserId,
      table.category,
      table.status
    ),
    check(
      "email_outbox_status_valid",
      sql`${table.status} in ('pending', 'processing', 'sent', 'failed', 'skipped')`
    ),
    check(
      "email_outbox_category_valid",
      sql`${table.category} in ('transactional', 'listing_update')`
    ),
    check("email_outbox_attempts_nonnegative", sql`${table.attempts} >= 0`),
  ]
)
