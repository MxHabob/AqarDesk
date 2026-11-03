import { userHasPermission } from "@aqardesk/database/queries"

export async function hasPermission(userId: string, permissionKey: string) {
  return userHasPermission(userId, permissionKey)
}

export async function assertPermission(userId: string, permissionKey: string) {
  if (!(await hasPermission(userId, permissionKey))) {
    throw new Error("Forbidden")
  }
}
