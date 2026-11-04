"use server"

import { randomUUID } from "node:crypto"
import { auth } from "@aqardesk/auth/server"
import { getDatabase } from "@aqardesk/database"
import {
  createRole,
  deleteRole,
  getUserPermissionKeys,
  getUserRoleKeys,
  listPermissions,
  listRoles,
  setRolePermissions,
  updateRole,
} from "@aqardesk/database/queries"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod"
import { assertPermission } from "@/lib/auth/permissions"

const roleSchema = z.object({
  id: z.string().trim().optional(),
  key: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z][a-z0-9._-]*$/),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).nullable(),
  permissionIds: z.array(z.string().trim().min(1)).max(100),
})

const protectedRoleKeys = new Set([
  "admin",
  "customer",
  "manager",
  "staff",
  "viewer",
])

async function getActor() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")
  await assertPermission(session.user.id, "roles.manage")
  return session.user
}

function getPermissionIds(formData: FormData) {
  return [
    ...new Set(formData.getAll("permissionIds").map((value) => String(value))),
  ]
}

async function validatePermissions(permissionIds: string[]) {
  const permissions = await listPermissions()
  const allowedIds = new Set(permissions.map((permission) => permission.id))
  if (permissionIds.some((permissionId) => !allowedIds.has(permissionId))) {
    throw new Error("One or more selected permissions are unavailable.")
  }
}

export async function saveRoleAction(formData: FormData) {
  const actor = await getActor()
  const id = String(formData.get("id") ?? "").trim()
  const values = roleSchema.parse({
    id: id || undefined,
    key: formData.get("key"),
    name: formData.get("name"),
    description: String(formData.get("description") ?? "").trim() || null,
    permissionIds: getPermissionIds(formData),
  })

  const currentRoles = await listRoles()
  const currentRole = values.id
    ? currentRoles.find((role) => role.id === values.id)
    : undefined
  if (values.id && !currentRole) {
    throw new Error("The selected role does not exist.")
  }
  if (currentRole && currentRole.key !== values.key) {
    throw new Error("A role's key cannot be changed after creation.")
  }
  if (!currentRole && currentRoles.some((role) => role.key === values.key)) {
    throw new Error("A role with this key already exists.")
  }

  await validatePermissions(values.permissionIds)
  const actorRoles = await getUserRoleKeys(actor.id)
  const actorPermissions = await getUserPermissionKeys(actor.id)
  const permissions = await listPermissions()
  const rolesManagePermission = permissions.find(
    (permission) => permission.key === "roles.manage"
  )
  const usersManagePermission = permissions.find(
    (permission) => permission.key === "users.manage"
  )
  if (
    currentRole &&
    actorRoles.includes(currentRole.key) &&
    actorPermissions.includes("roles.manage") &&
    rolesManagePermission &&
    !values.permissionIds.includes(rolesManagePermission.id)
  ) {
    throw new Error("You cannot remove your own role management access.")
  }
  if (
    currentRole &&
    actorRoles.includes(currentRole.key) &&
    actorPermissions.includes("users.manage") &&
    usersManagePermission &&
    !values.permissionIds.includes(usersManagePermission.id)
  ) {
    throw new Error("You cannot remove your own user management access.")
  }

  const database = getDatabase()
  await database.transaction(async (transaction) => {
    if (currentRole) {
      const updated = await updateRole(
        currentRole.id,
        { name: values.name, description: values.description },
        actor,
        transaction
      )
      if (!updated) throw new Error("The role could not be updated.")
      await setRolePermissions(
        currentRole.id,
        values.permissionIds,
        actor,
        transaction
      )
    } else {
      const role = await createRole(
        {
          id: randomUUID(),
          key: values.key,
          name: values.name,
          description: values.description,
        },
        actor,
        transaction
      )
      if (!role) throw new Error("The role could not be created.")
      await setRolePermissions(
        role.id,
        values.permissionIds,
        actor,
        transaction
      )
    }
  })

  revalidatePath("/[locale]/dashboard/settings/roles", "page")
  revalidatePath("/[locale]/dashboard/users", "page")
}

export async function deleteRoleAction(formData: FormData) {
  const actor = await getActor()
  const id = z.string().trim().min(1).parse(formData.get("id"))
  const role = (await listRoles()).find((item) => item.id === id)
  if (!role) throw new Error("The selected role does not exist.")
  if (protectedRoleKeys.has(role.key)) {
    throw new Error("Built-in roles cannot be deleted.")
  }

  const result = await deleteRole(id, actor)
  if (!result.deleted) {
    throw new Error(
      result.reason === "assigned"
        ? "This role is assigned to users and cannot be deleted."
        : "The selected role does not exist."
    )
  }

  revalidatePath("/[locale]/dashboard/settings/roles", "page")
  revalidatePath("/[locale]/dashboard/users", "page")
}
