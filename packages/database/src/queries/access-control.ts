import { and, eq } from "drizzle-orm"
import { getDatabase, schema } from "../index"
import { writeAuditLog } from "../utils/audit-log"
import { withTransaction } from "../utils/database"
import type { DatabaseOrTransaction } from "./types"

export async function listRoles(database = getDatabase()) {
  return database.select().from(schema.roles).orderBy(schema.roles.name)
}

export async function listPermissions(database = getDatabase()) {
  return database
    .select()
    .from(schema.permissions)
    .orderBy(schema.permissions.key)
}

export async function createRole(
  values: typeof schema.roles.$inferInsert,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [role] = await transaction
      .insert(schema.roles)
      .values(values)
      .returning()
    if (role) {
      await writeAuditLog(
        {
          actorId: actor.id,
          actorName: actor.name,
          actorEmail: actor.email,
          action: "role.created",
          entityType: "role",
          entityId: role.id,
          after: { key: role.key, name: role.name },
        },
        transaction
      )
    }
    return role
  }, database)
}

export async function updateRole(
  id: string,
  values: Partial<
    Pick<typeof schema.roles.$inferInsert, "key" | "name" | "description">
  >,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [before] = await transaction
      .select({
        key: schema.roles.key,
        name: schema.roles.name,
        description: schema.roles.description,
      })
      .from(schema.roles)
      .where(eq(schema.roles.id, id))
      .limit(1)
    if (!before) return undefined

    const [role] = await transaction
      .update(schema.roles)
      .set(values)
      .where(eq(schema.roles.id, id))
      .returning()

    if (role) {
      await writeAuditLog(
        {
          actorId: actor.id,
          actorName: actor.name,
          actorEmail: actor.email,
          action: "role.updated",
          entityType: "role",
          entityId: role.id,
          before,
          after: {
            key: role.key,
            name: role.name,
            description: role.description,
          },
        },
        transaction
      )
    }

    return role
  }, database)
}

export async function setRolePermissions(
  roleId: string,
  permissionIds: string[],
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const uniquePermissionIds = [...new Set(permissionIds)]
    const previous = await transaction
      .select({ permissionId: schema.rolePermissions.permissionId })
      .from(schema.rolePermissions)
      .where(eq(schema.rolePermissions.roleId, roleId))

    await transaction
      .delete(schema.rolePermissions)
      .where(eq(schema.rolePermissions.roleId, roleId))

    if (uniquePermissionIds.length > 0) {
      await transaction.insert(schema.rolePermissions).values(
        uniquePermissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        }))
      )
    }

    await writeAuditLog(
      {
        actorId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: "role.permissions_updated",
        entityType: "role",
        entityId: roleId,
        before: {
          permissionIds: previous.map(({ permissionId }) => permissionId),
        },
        after: { permissionIds: uniquePermissionIds },
      },
      transaction
    )

    return uniquePermissionIds
  }, database)
}

export async function getUserRoleKeys(
  userId: string,
  database = getDatabase()
) {
  const rows = await database
    .select({ key: schema.roles.key })
    .from(schema.userRoles)
    .innerJoin(schema.roles, eq(schema.userRoles.roleId, schema.roles.id))
    .where(eq(schema.userRoles.userId, userId))

  return rows.map(({ key }) => key)
}

export async function getUserPermissionKeys(
  userId: string,
  database = getDatabase()
) {
  const rows = await database
    .select({ key: schema.permissions.key })
    .from(schema.userRoles)
    .innerJoin(
      schema.rolePermissions,
      eq(schema.userRoles.roleId, schema.rolePermissions.roleId)
    )
    .innerJoin(
      schema.permissions,
      eq(schema.rolePermissions.permissionId, schema.permissions.id)
    )
    .where(eq(schema.userRoles.userId, userId))

  return [...new Set(rows.map(({ key }) => key))]
}

export async function userHasPermission(
  userId: string,
  permissionKey: string,
  database = getDatabase()
) {
  const [permission] = await database
    .select({ id: schema.permissions.id })
    .from(schema.userRoles)
    .innerJoin(
      schema.rolePermissions,
      eq(schema.userRoles.roleId, schema.rolePermissions.roleId)
    )
    .innerJoin(
      schema.permissions,
      eq(schema.rolePermissions.permissionId, schema.permissions.id)
    )
    .where(
      and(
        eq(schema.userRoles.userId, userId),
        eq(schema.permissions.key, permissionKey)
      )
    )
    .limit(1)

  return Boolean(permission)
}

export async function setUserRoles(
  userId: string,
  roleIds: string[],
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const uniqueRoleIds = [...new Set(roleIds)]
    const existingRoles = await transaction
      .select({ id: schema.userRoles.roleId })
      .from(schema.userRoles)
      .where(eq(schema.userRoles.userId, userId))

    await transaction
      .delete(schema.userRoles)
      .where(eq(schema.userRoles.userId, userId))
    if (uniqueRoleIds.length > 0) {
      await transaction.insert(schema.userRoles).values(
        uniqueRoleIds.map((roleId) => ({
          userId,
          roleId,
          assignedById: actor.id,
        }))
      )
    }

    await writeAuditLog(
      {
        actorId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: "user.roles_updated",
        entityType: "user",
        entityId: userId,
        before: { roleIds: existingRoles.map(({ id }) => id) },
        after: { roleIds: uniqueRoleIds },
      },
      transaction
    )
  }, database)
}
