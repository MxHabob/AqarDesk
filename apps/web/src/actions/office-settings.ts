"use server"

import { auth } from "@aqardesk/auth/server"
import {
  getOfficeSettings,
  updateOfficeSettings,
} from "@aqardesk/database/queries"
import { headers } from "next/headers"
import { z } from "zod"
import { assertPermission } from "@/lib/auth/permissions"
import { isCountryCode } from "@/lib/countries"

const officeSettingsSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  logoUrl: z.string().min(1).max(1024).nullable().optional(),
  email: z.email().nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  website: z.url().nullable().optional(),
  address: z.string().trim().max(300).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  region: z.string().trim().max(100).nullable().optional(),
  postalCode: z.string().trim().max(20).nullable().optional(),
  countryCode: z.string().refine(isCountryCode).optional(),
  defaultCurrency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional(),
  fiscalYearStartMonth: z.number().int().min(1).max(12).optional(),
})

async function getActor() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")
  return session.user
}

export async function getOfficeSettingsAction() {
  const actor = await getActor()
  await assertPermission(actor.id, "office_settings.read")
  return getOfficeSettings()
}

export async function getOfficeMetricsSettingsAction() {
  await getActor()
  const { id, fiscalYearStartMonth } = await getOfficeSettings()
  return { id, fiscalYearStartMonth }
}

export async function updateOfficeSettingsAction(input: unknown) {
  const values = officeSettingsSchema.parse(input)
  const actor = await getActor()
  await assertPermission(actor.id, "office_settings.manage")
  return updateOfficeSettings({ ...values, updatedById: actor.id })
}
