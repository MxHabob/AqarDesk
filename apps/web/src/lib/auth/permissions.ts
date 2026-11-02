import { getDatabase, schema } from "@aqardesk/database"
import { and, eq } from "drizzle-orm"

export async function assertPermission(userId: string, permissionKey: string) {
  const database = getDatabase()
  const [permission] = await database
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
    .where(
      and(
        eq(schema.userRoles.userId, userId),
        eq(schema.permissions.key, permissionKey)
      )
    )
    .limit(1)

  if (!permission) {
    throw new Error("Forbidden")
  }
}
