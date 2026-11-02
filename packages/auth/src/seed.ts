import { closeDatabase, getDatabase, schema } from "@aqardesk/database"
import { hashPassword } from "better-auth/crypto"
import { and, eq } from "drizzle-orm"

const adminEmail = "admin@aqrdesk.com"
const adminPassword = "admin"

async function seedAdmin() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "The default admin account cannot be created in production."
    )
  }

  const db = getDatabase()
  const [existingUser] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, adminEmail))
    .limit(1)

  const isNewAdmin = !existingUser
  const adminUserId = existingUser?.id ?? crypto.randomUUID()
  const passwordHash = isNewAdmin ? await hashPassword(adminPassword) : null

  await db.transaction(async (tx) => {
    if (passwordHash) {
      await tx.insert(schema.users).values({
        id: adminUserId,
        name: "مدير النظام",
        email: adminEmail,
        emailVerified: true,
      })

      await tx.insert(schema.accounts).values({
        id: crypto.randomUUID(),
        accountId: adminUserId,
        providerId: "credential",
        userId: adminUserId,
        password: passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    await tx
      .delete(schema.userRoles)
      .where(
        and(
          eq(schema.userRoles.userId, adminUserId),
          eq(schema.userRoles.roleId, "customer")
        )
      )

    await tx
      .insert(schema.userRoles)
      .values({ userId: adminUserId, roleId: "admin" })
      .onConflictDoNothing()
  })

  console.info(
    existingUser
      ? "Existing admin account has been assigned the admin role; its password was not changed."
      : `Created ${adminEmail} with the development password.`
  )
}

try {
  await seedAdmin()
} finally {
  await closeDatabase()
}
