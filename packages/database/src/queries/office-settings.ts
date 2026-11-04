import { eq } from "drizzle-orm"
import { getDatabase, schema } from "../index"
import { writeAuditLog } from "../utils/audit-log"
import { withTransaction } from "../utils/database"
import type { DatabaseOrTransaction } from "./types"

export async function getOfficeSettings(
  database = getDatabase()
): Promise<typeof schema.officeSettings.$inferSelect> {
  const [existing] = await database
    .select()
    .from(schema.officeSettings)
    .where(eq(schema.officeSettings.id, "default"))
    .limit(1)

  if (existing) return existing

  const [created] = await database
    .insert(schema.officeSettings)
    .values({ id: "default", name: "عقار دِسك" })
    .onConflictDoNothing()
    .returning()
  if (created) return created

  const [concurrentInsert] = await database
    .select()
    .from(schema.officeSettings)
    .where(eq(schema.officeSettings.id, "default"))
    .limit(1)

  if (!concurrentInsert) {
    throw new Error("Office settings could not be initialized.")
  }

  return concurrentInsert
}

export async function updateOfficeSettings(
  values: Partial<typeof schema.officeSettings.$inferInsert> & {
    updatedById: string
  },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [before] = await transaction
      .select()
      .from(schema.officeSettings)
      .where(eq(schema.officeSettings.id, "default"))
      .limit(1)
    const [settings] = await transaction
      .insert(schema.officeSettings)
      .values({ ...values, id: "default" })
      .onConflictDoUpdate({
        target: schema.officeSettings.id,
        set: { ...values, updatedAt: new Date() },
      })
      .returning()

    if (!settings) {
      throw new Error("Office settings could not be updated.")
    }

    await writeAuditLog(
      {
        actorId: values.updatedById,
        action: "office_settings.updated",
        entityType: "office_settings",
        entityId: "default",
        before: before
          ? {
              name: before.name,
              email: before.email,
              phone: before.phone,
              address: before.address,
              city: before.city,
              countryCode: before.countryCode,
              defaultCurrency: before.defaultCurrency,
              propertyFieldSettings: before.propertyFieldSettings,
              timezone: before.timezone,
            }
          : null,
        after: {
          name: settings.name,
          email: settings.email,
          phone: settings.phone,
          address: settings.address,
          city: settings.city,
          countryCode: settings.countryCode,
          defaultCurrency: settings.defaultCurrency,
          propertyFieldSettings: settings.propertyFieldSettings,
          timezone: settings.timezone,
        },
      },
      transaction
    )

    return settings
  }, database)
}
