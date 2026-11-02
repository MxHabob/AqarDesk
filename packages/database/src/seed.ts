import { closeDatabase, getDatabase } from "./index"
import { permissions, rolePermissions, roles } from "./schema"

const permissionDefinitions = [
  ["properties.read", "View properties"],
  ["properties.create", "Create properties"],
  ["properties.update", "Update properties"],
  ["properties.archive", "Archive properties"],
  ["listings.read", "View listings"],
  ["listings.create", "Create listings"],
  ["listings.update", "Update listings"],
  ["listings.publish", "Publish listings"],
  ["listings.close", "Close listings"],
  ["owners.read", "View owner records"],
  ["owners.create", "Create owner records"],
  ["owners.update", "Update owner records"],
  ["media.manage", "Manage listing media"],
  ["favorites.manage", "Manage favorites"],
  ["users.manage", "Manage user accounts"],
  ["roles.manage", "Manage roles and permissions"],
  ["audit.read", "View change history"],
] as const

const allPermissions = permissionDefinitions.map(([key]) => key)
const readPermissions = [
  "properties.read",
  "listings.read",
  "owners.read",
] as const

const roleDefinitions = [
  {
    key: "customer",
    name: "Customer",
    description: "Customer account with no office permissions.",
    permissionKeys: [],
  },
  {
    key: "admin",
    name: "Administrator",
    description: "Full access to office data and access control.",
    permissionKeys: allPermissions,
  },
  {
    key: "manager",
    name: "Manager",
    description: "Manage listings, properties, and owner records.",
    permissionKeys: permissionDefinitions
      .map(([key]) => key)
      .filter((key) => key !== "users.manage" && key !== "roles.manage"),
  },
  {
    key: "staff",
    name: "Staff",
    description: "Create and maintain property listings.",
    permissionKeys: [
      ...readPermissions,
      "properties.create",
      "properties.update",
      "listings.create",
      "listings.update",
      "listings.publish",
      "owners.create",
      "owners.update",
      "media.manage",
      "favorites.manage",
    ],
  },
  {
    key: "viewer",
    name: "Read only",
    description: "View property, listing, and owner records.",
    permissionKeys: readPermissions,
  },
] as const

async function seed() {
  const db = getDatabase()

  await db.transaction(async (tx) => {
    await tx
      .insert(roles)
      .values(
        roleDefinitions.map(({ key, name, description }) => ({
          id: key,
          key,
          name,
          description,
        }))
      )
      .onConflictDoNothing()

    await tx
      .insert(permissions)
      .values(
        permissionDefinitions.map(([key, description]) => ({
          id: key,
          key,
          description,
        }))
      )
      .onConflictDoNothing()

    await tx
      .insert(rolePermissions)
      .values(
        roleDefinitions.flatMap(({ key, permissionKeys }) =>
          permissionKeys.map((permissionId) => ({
            roleId: key,
            permissionId,
          }))
        )
      )
      .onConflictDoNothing()
  })
}

try {
  await seed()
  console.info("Default roles and permissions are ready.")
} finally {
  await closeDatabase()
}
