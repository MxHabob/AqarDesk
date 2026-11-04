import { sql } from "drizzle-orm"
import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"
import { users } from "./auth"
import { roles } from "./access-control"

export const userInvitations = pgTable(
  "user_invitation",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    invitedById: text("invited_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("user_invitation_created_at_idx").on(table.createdAt),
    index("user_invitation_user_id_idx").on(table.userId),
    index("user_invitation_expiration_idx").on(
      table.expiresAt,
      table.acceptedAt,
      table.revokedAt
    ),
    uniqueIndex("user_invitation_pending_email_idx")
      .on(table.email)
      .where(
        sql`${table.acceptedAt} is null and ${table.revokedAt} is null`
      ),
  ]
)

export const userInvitationRoles = pgTable(
  "user_invitation_role",
  {
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => userInvitations.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.invitationId, table.roleId] }),
    index("user_invitation_role_role_id_idx").on(table.roleId),
  ]
)
