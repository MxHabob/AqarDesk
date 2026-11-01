import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

import { users } from "./auth"

export const roles = pgTable("role", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const permissions = pgTable("permission", {
  id: text("id").primaryKey(),
  key: text("key").notNull(),
  description: text("description"),
})

export const rolePermissions = pgTable(
  "role_permission",
  {
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: text("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.permissionId] }),
    index("role_permission_permission_id_idx").on(table.permissionId),
  ]
)

export const userRoles = pgTable(
  "user_role",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    assignedById: text("assigned_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.roleId] }),
    index("user_role_role_id_idx").on(table.roleId),
  ]
)
