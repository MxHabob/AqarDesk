import { getUserRoleKeys as queryUserRoleKeys } from "@aqardesk/database/queries"

const employeeRoles = new Set(["admin", "manager", "staff", "viewer"])

export async function getUserRoleKeys(userId: string) {
  return queryUserRoleKeys(userId)
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
