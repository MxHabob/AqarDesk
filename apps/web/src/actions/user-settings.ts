"use server"

import { auth } from "@aqardesk/auth/server"
import { getUserById, updateUser } from "@aqardesk/database/queries"
import { headers } from "next/headers"
import { z } from "zod"

const userSettingsSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    fullName: z.string().trim().min(1).max(100).optional(),
    image: z.string().min(1).max(1024).nullable().optional(),
    avatarUrl: z.string().min(1).max(1024).nullable().optional(),
    locale: z.enum(["ar", "en"]).optional(),
    timezone: z.string().min(1).max(100).optional(),
    timezoneAutoSync: z.boolean().optional(),
    dateFormat: z
      .enum(["dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd", "dd.MM.yyyy"])
      .optional(),
    timeFormat: z.union([z.literal(12), z.literal(24)]).optional(),
    weekStartsOnMonday: z.boolean().optional(),
    email: z.email().optional(),
  })
  .strict()

export async function getCurrentUserSettingsAction() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")
  const user = await getUserById(session.user.id)
  if (!user) throw new Error("Authenticated user was not found.")

  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    avatarUrl: user.image,
    locale: user.locale,
    timezone: user.timezone,
    timezoneAutoSync: user.timezoneAutoSync,
    dateFormat: user.dateFormat,
    timeFormat: user.timeFormat,
    weekStartsOnMonday: user.weekStartsOnMonday,
  }
}

export async function updateCurrentUserSettingsAction(input: unknown) {
  const values = userSettingsSchema.parse(input)
  if (Object.keys(values).length === 0) {
    throw new Error("At least one account setting is required.")
  }
  if (values.email) {
    throw new Error("Email changes require a verified email-change flow.")
  }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")

  const { email: _email, fullName, avatarUrl, ...providedUpdates } = values
  const updates = {
    ...providedUpdates,
    ...(fullName !== undefined ? { name: fullName } : {}),
    ...(avatarUrl !== undefined ? { image: avatarUrl } : {}),
  }
  const user = await updateUser(session.user.id, updates, {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  })
  if (!user) throw new Error("User settings could not be updated.")

  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    avatarUrl: user.image,
    locale: user.locale,
    timezone: user.timezone,
    timezoneAutoSync: user.timezoneAutoSync,
    dateFormat: user.dateFormat,
    timeFormat: user.timeFormat,
    weekStartsOnMonday: user.weekStartsOnMonday,
  }
}
