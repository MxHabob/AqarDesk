import { getDatabase, schema } from "@aqardesk/database"
import { eq } from "drizzle-orm"

const employeeRoles = new Set(["admin", "manager", "staff", "viewer"])

export async function getUserRoleKeys(userId: string) {
  return getDatabase()
    .select({ key: schema.roles.key })
    .from(schema.userRoles)
    .innerJoin(schema.roles, eq(schema.userRoles.roleId, schema.roles.id))
    .where(eq(schema.userRoles.userId, userId))
    .then((roles) => roles.map(({ key }) => key))
}

export function getRoleDestination(roleKeys: string[], locale: string) {
  if (roleKeys.some((role) => employeeRoles.has(role))) {
    return `/${locale}/dashboard`
  }

  if (roleKeys.includes("customer")) {
    return `/${locale}/account`
  }

  return null
}
