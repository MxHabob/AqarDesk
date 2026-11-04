"use server"

import { randomUUID } from "node:crypto"
import { auth } from "@aqardesk/auth/server"
import { getDatabase } from "@aqardesk/database"
import {
  countUsersWithRole,
  createUser,
  deleteUser,
  getPermissionKeysForRoles,
  getUserByEmail,
  getUserById,
  getUserPermissionKeys,
  getUserRoleKeys,
  listRoles,
  revokeUserSessions,
  setUserRoles,
  updateUser,
} from "@aqardesk/database/queries"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod"
import { assertPermission, hasPermission } from "@/lib/auth/permissions"

const userProfileSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(2).max(100),
  email: z
    .string()
    .trim()
    .pipe(z.email())
    .transform((email) => email.toLowerCase()),
  emailVerified: z.boolean(),
  locale: z.enum(["ar", "en"]),
  timezone: z.string().trim().min(1).max(100),
  timezoneAutoSync: z.boolean(),
  dateFormat: z.string().trim().min(1).max(32),
  timeFormat: z.union([z.literal(12), z.literal(24)]),
  weekStartsOnMonday: z.boolean(),
  roleIds: z.array(z.string().trim().min(1)).min(1).max(50),
})

function validateTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone }).format(new Date())
  } catch {
    throw new Error("The selected time zone is invalid.")
  }
}

async function getActor() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")
  await assertPermission(session.user.id, "users.manage")
  return session.user
}

async function validateRoleIds(roleIds: string[]) {
  const roles = await listRoles()
  const allowedIds = new Set(roles.map((role) => role.id))
  if (roleIds.some((roleId) => !allowedIds.has(roleId))) {
    throw new Error("One or more selected roles are unavailable.")
  }
}

async function protectRoleAssignments(
  actorId: string,
  targetUserId: string,
  nextRoleIds: string[]
) {
  const actorCanManageRoles = await hasPermission(actorId, "roles.manage")
  const currentRoleKeys = await getUserRoleKeys(targetUserId)
  const currentPermissionKeys = await getUserPermissionKeys(targetUserId)
  const allRoles = await listRoles()
  const nextRoleKeys = allRoles
    .filter((role) => nextRoleIds.includes(role.id))
    .map((role) => role.key)

  if (!actorCanManageRoles && currentPermissionKeys.includes("roles.manage")) {
    throw new Error("Only a role administrator can edit this account.")
  }

  const nextPermissionKeys = await getPermissionKeysForRoles(nextRoleIds)
  if (
    !actorCanManageRoles &&
    nextPermissionKeys.some((key) =>
      ["roles.manage", "users.manage"].includes(key)
    )
  ) {
    throw new Error("You cannot assign an account management permission.")
  }

  const adminRole = allRoles.find((role) => role.key === "admin")
  const removingAdmin =
    currentRoleKeys.includes("admin") && !nextRoleKeys.includes("admin")
  if (
    removingAdmin &&
    adminRole &&
    (await countUsersWithRole(adminRole.id)) <= 1
  ) {
    throw new Error("The last administrator cannot be removed.")
  }

  if (targetUserId === actorId) {
    const currentPermissions = await getUserPermissionKeys(actorId)
    if (
      currentPermissions.includes("users.manage") &&
      !nextPermissionKeys.includes("users.manage")
    ) {
      throw new Error("You cannot remove your own user management access.")
    }
    if (
      currentPermissions.includes("roles.manage") &&
      !nextPermissionKeys.includes("roles.manage")
    ) {
      throw new Error("You cannot remove your own role management access.")
    }
  }
}

function getRoleIds(formData: FormData) {
  return [...new Set(formData.getAll("roleIds").map((value) => String(value)))]
}

export async function createManagedUserAction(formData: FormData) {
  const actor = await getActor()
  const values = userProfileSchema.omit({ id: true }).parse({
    name: formData.get("name"),
    email: formData.get("email"),
    emailVerified: formData.get("emailVerified") === "on",
    locale: formData.get("locale"),
    timezone: formData.get("timezone"),
    timezoneAutoSync: formData.get("timezoneAutoSync") === "on",
    dateFormat: formData.get("dateFormat"),
    timeFormat: Number(formData.get("timeFormat")),
    weekStartsOnMonday: formData.get("weekStartsOnMonday") === "on",
    roleIds: getRoleIds(formData),
  })

  validateTimezone(values.timezone)
  if (await getUserByEmail(values.email)) {
    throw new Error("An account already exists for this email address.")
  }
  await validateRoleIds(values.roleIds)
  await protectRoleAssignments(actor.id, "", values.roleIds)

  const database = getDatabase()
  await database.transaction(async (transaction) => {
    const user = await createUser(
      {
        id: randomUUID(),
        name: values.name,
        email: values.email,
        emailVerified: values.emailVerified,
        locale: values.locale,
        timezone: values.timezone,
        timezoneAutoSync: values.timezoneAutoSync,
        dateFormat: values.dateFormat,
        timeFormat: values.timeFormat,
        weekStartsOnMonday: values.weekStartsOnMonday,
      },
      actor,
      transaction
    )
    if (!user) throw new Error("The account could not be created.")
    if (values.roleIds.length > 0) {
      await setUserRoles(user.id, values.roleIds, actor, transaction)
    }
  })

  revalidatePath("/[locale]/dashboard/users", "page")
}

export async function updateManagedUserAction(formData: FormData) {
  const actor = await getActor()
  const values = userProfileSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
    emailVerified: formData.get("emailVerified") === "on",
    locale: formData.get("locale"),
    timezone: formData.get("timezone"),
    timezoneAutoSync: formData.get("timezoneAutoSync") === "on",
    dateFormat: formData.get("dateFormat"),
    timeFormat: Number(formData.get("timeFormat")),
    weekStartsOnMonday: formData.get("weekStartsOnMonday") === "on",
    roleIds: getRoleIds(formData),
  })

  validateTimezone(values.timezone)
  const user = await getUserById(values.id)
  if (!user) throw new Error("The selected account does not exist.")
  const existingUser = await getUserByEmail(values.email)
  if (existingUser && existingUser.id !== values.id) {
    throw new Error("An account already exists for this email address.")
  }

  await validateRoleIds(values.roleIds)
  await protectRoleAssignments(actor.id, values.id, values.roleIds)

  const database = getDatabase()
  await database.transaction(async (transaction) => {
    const updated = await updateUser(
      values.id,
      {
        name: values.name,
        email: values.email,
        emailVerified: values.emailVerified,
        locale: values.locale,
        timezone: values.timezone,
        timezoneAutoSync: values.timezoneAutoSync,
        dateFormat: values.dateFormat,
        timeFormat: values.timeFormat,
        weekStartsOnMonday: values.weekStartsOnMonday,
      },
      actor,
      transaction
    )
    if (!updated) throw new Error("The account could not be updated.")
    await setUserRoles(values.id, values.roleIds, actor, transaction)
  })

  revalidatePath("/[locale]/dashboard/users", "page")
}

export async function deleteManagedUserAction(formData: FormData) {
  const actor = await getActor()
  const userId = z.string().trim().min(1).parse(formData.get("id"))
  if (userId === actor.id) {
    throw new Error("You cannot delete your own account.")
  }

  const roleKeys = await getUserRoleKeys(userId)
  const roles = await listRoles()
  const adminRole = roles.find((role) => role.key === "admin")
  if (
    roleKeys.includes("admin") &&
    adminRole &&
    (await countUsersWithRole(adminRole.id)) <= 1
  ) {
    throw new Error("The last administrator cannot be deleted.")
  }
  if (
    (roleKeys.includes("admin") ||
      (await getUserPermissionKeys(userId)).some((key) =>
        ["roles.manage", "users.manage"].includes(key)
      )) &&
    !(await hasPermission(actor.id, "roles.manage"))
  ) {
    throw new Error("Only a role administrator can delete an administrator.")
  }

  const deleted = await deleteUser(userId, actor)
  if (!deleted) throw new Error("The selected account does not exist.")
  revalidatePath("/[locale]/dashboard/users", "page")
}

export async function revokeManagedUserSessionsAction(formData: FormData) {
  const actor = await getActor()
  const userId = z.string().trim().min(1).parse(formData.get("id"))
  if (userId === actor.id) {
    throw new Error("You cannot revoke your own active session here.")
  }
  if (!(await getUserById(userId))) {
    throw new Error("The selected account does not exist.")
  }
  const targetPermissions = await getUserPermissionKeys(userId)
  if (
    targetPermissions.some((key) =>
      ["roles.manage", "users.manage"].includes(key)
    ) &&
    !(await hasPermission(actor.id, "roles.manage"))
  ) {
    throw new Error(
      "Only a role administrator can revoke this account's sessions."
    )
  }

  await revokeUserSessions(userId, actor)
  revalidatePath("/[locale]/dashboard/users", "page")
}

export async function bulkDeleteManagedUsersAction(idsInput: string[]) {
  const actor = await getActor()
  const ids = [
    ...new Set(
      z.array(z.string().trim().min(1)).min(1).max(100).parse(idsInput)
    ),
  ]
  if (ids.includes(actor.id)) {
    throw new Error("You cannot delete your own account.")
  }

  const roles = await listRoles()
  const adminRole = roles.find((role) => role.key === "admin")
  const actorPermissionKeys = await getUserPermissionKeys(actor.id)
  let adminCount = adminRole ? await countUsersWithRole(adminRole.id) : 0
  let affectedCount = 0
  const failedIds: string[] = []

  for (const id of ids) {
    const user = await getUserById(id)
    if (!user) {
      failedIds.push(id)
      continue
    }

    const targetRoleKeys = await getUserRoleKeys(id)
    const targetPermissions = await getUserPermissionKeys(id)
    if (
      (targetPermissions.includes("roles.manage") ||
        targetPermissions.includes("users.manage")) &&
      !actorPermissionKeys.includes("roles.manage")
    ) {
      failedIds.push(id)
      continue
    }
    if (targetRoleKeys.includes("admin")) {
      if (adminCount <= 1) {
        failedIds.push(id)
        continue
      }
      adminCount -= 1
    }

    const deleted = await deleteUser(id, actor)
    if (deleted) affectedCount += 1
    else failedIds.push(id)
  }

  revalidatePath("/[locale]/dashboard/users", "page")
  return {
    affectedCount,
    skippedCount: ids.length - affectedCount,
    failedIds,
  }
}

export async function bulkRevokeManagedUserSessionsAction(idsInput: string[]) {
  const actor = await getActor()
  const ids = [
    ...new Set(
      z.array(z.string().trim().min(1)).min(1).max(100).parse(idsInput)
    ),
  ]
  if (ids.includes(actor.id)) {
    throw new Error("You cannot revoke your own active session here.")
  }

  const actorPermissionKeys = await getUserPermissionKeys(actor.id)
  let affectedCount = 0
  const failedIds: string[] = []
  for (const id of ids) {
    if (!(await getUserById(id))) {
      failedIds.push(id)
      continue
    }
    const targetPermissions = await getUserPermissionKeys(id)
    if (
      targetPermissions.some((key) =>
        ["roles.manage", "users.manage"].includes(key)
      ) &&
      !actorPermissionKeys.includes("roles.manage")
    ) {
      failedIds.push(id)
      continue
    }
    await revokeUserSessions(id, actor)
    affectedCount += 1
  }

  revalidatePath("/[locale]/dashboard/users", "page")
  return {
    affectedCount,
    skippedCount: ids.length - affectedCount,
    failedIds,
  }
}
