import { sql } from "drizzle-orm"
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { users } from "./auth"
import { mediaTypeEnum } from "./enums"
import { listings } from "./listings"

export const listingMedia = pgTable(
  "listing_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    type: mediaTypeEnum("type").notNull(),
    storageProvider: text("storage_provider").notNull(),
    objectKey: text("object_key").notNull(),
    originalFilename: text("original_filename"),
    contentType: text("content_type"),
    sizeBytes: bigint("size_bytes", { mode: "number" }),
    altText: text("alt_text"),
    position: integer("position").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),
    uploadedById: text("uploaded_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("listing_media_storage_object_idx").on(
      table.storageProvider,
      table.objectKey
    ),
    index("listing_media_listing_position_idx").on(
      table.listingId,
      table.position
    ),
    index("listing_media_type_idx").on(table.listingId, table.type),
    uniqueIndex("listing_media_primary_photo_idx")
      .on(table.listingId)
      .where(sql`${table.isPrimary} = true and ${table.type} = 'photo'`),
    check("listing_media_position_nonnegative", sql`${table.position} >= 0`),
    check(
      "listing_media_size_nonnegative",
      sql`${table.sizeBytes} is null or ${table.sizeBytes} >= 0`
    ),
  ]
)
