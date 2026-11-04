"use server"

import { randomBytes, randomUUID, createHash } from "node:crypto"
import { auth } from "@aqardesk/auth/server"
import { createStaffInvitationEmail } from "@aqardesk/email"
import { getDatabase } from "@aqardesk/database"
import {
  acceptUserInvitation,
  createUser,
  createUserInvitation,
  getUserByEmail,
  getUserById,
  getUserInvitationByTokenHash,
  getPermissionKeysForRoles,
  listRoles,
  listUserInvitations,
  replaceUserInvitationToken,
  revokeUserInvitation,
  setUserRoles,
} from "@aqardesk/database/queries"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { assertPermission, hasPermission } from "@/lib/auth/permissions"

const inviteSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z
    .string()
    .trim()
    .pipe(z.email())
    .transform((email) => email.toLowerCase()),
  locale: z.enum(["ar", "en"]),
  roleIds: z.array(z.string().trim().min(1)).min(1).max(50),
})

const invitationLifetimeMs = 7 * 24 * 60 * 60 * 1000

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

function createToken() {
  return randomBytes(32).toString("base64url")
}

function getInvitationUrl(locale: string, token: string) {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim()
  if (!configuredOrigin) {
    throw new Error("Set NEXT_PUBLIC_APP_URL or BETTER_AUTH_URL to send invitations.")
  }
  const origin = new URL(configuredOrigin).origin
  const url = new URL(`/${locale}/invite/accept`, origin)
  url.searchParams.set("token", token)
  return url.toString()
}

async function sendInvitationEmail(input: {
  email: string
  name: string
  locale: string
  token: string
  expiresAt: Date
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.EMAIL_FROM?.trim()
  if (!apiKey || !from) {
    throw new Error("Invitation email is not configured. Set RESEND_API_KEY and EMAIL_FROM.")
  }
  const email = await createStaffInvitationEmail({
    to: input.email,
    recipientName: input.name,
    officeName: "AqarDesk",
    invitationUrl: getInvitationUrl(input.locale, input.token),
    expiresInHours: Math.max(
      1,
      Math.ceil((input.expiresAt.getTime() - Date.now()) / (60 * 60 * 1000))
    ),
  })
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.email],
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  })
  if (!response.ok) {
    throw new Error(
      `Invitation email delivery failed (${response.status} ${response.statusText}).`
    )
  }
}

async function getActor() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")
  await assertPermission(session.user.id, "users.manage")
  return session.user
}

function getRoleIds(formData: FormData) {
  return [...new Set(formData.getAll("roleIds").map(String))]
}

async function validateInvitedRoles(roleIds: string[], actorId: string) {
  const roles = await listRoles()
  const allowedIds = new Set(roles.map((role) => role.id))
  if (roleIds.some((roleId) => !allowedIds.has(roleId))) {
    throw new Error("One or more selected roles are unavailable.")
  }
  const permissions = await getPermissionKeysForRoles(roleIds)
  if (
    permissions.some((key) => ["roles.manage", "users.manage"].includes(key)) &&
    !(await hasPermission(actorId, "roles.manage"))
  ) {
    throw new Error("Only a role administrator can invite account administrators.")
  }
  return roles
}

export async function createUserInvitationAction(formData: FormData) {
  const actor = await getActor()
  const values = inviteSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    locale: formData.get("locale"),
    roleIds: getRoleIds(formData),
  })
  const roles = await validateInvitedRoles(values.roleIds, actor.id)
  if (await getUserByEmail(values.email)) {
    throw new Error("An account already exists for this email address.")
  }

  const customerRole = roles.find((role) => role.key === "customer")
  if (!customerRole) {
    throw new Error("The default customer role is missing.")
  }

  const token = createToken()
  const expiresAt = new Date(Date.now() + invitationLifetimeMs)
  const database = getDatabase()
  let invitationId: string | undefined
  await database.transaction(async (transaction) => {
    const user = await createUser(
      {
        id: randomUUID(),
        name: values.name,
        email: values.email,
        emailVerified: false,
        locale: values.locale,
        timezone: "Asia/Riyadh",
        timezoneAutoSync: true,
        dateFormat: "dd/MM/yyyy",
        timeFormat: 24,
        weekStartsOnMonday: true,
      },
      actor,
      transaction
    )
    if (!user) throw new Error("The invited account could not be created.")
    await setUserRoles(user.id, [customerRole.id], actor, transaction)
    const invitation = await createUserInvitation(
      {
        email: values.email,
        name: values.name,
        userId: user.id,
        tokenHash: hashToken(token),
        roleIds: values.roleIds,
        expiresAt,
      },
      actor,
      transaction
    )
    invitationId = invitation.id
  })

  try {
    await sendInvitationEmail({
      email: values.email,
      name: values.name,
      locale: values.locale,
      token,
      expiresAt,
    })
  } catch (error) {
    if (invitationId) await revokeUserInvitation(invitationId, actor)
    throw new Error(
      `The invitation was not sent: ${error instanceof Error ? error.message : "email delivery failed"}`
    )
  }
  revalidatePath("/[locale]/dashboard/users", "page")
}

export async function resendUserInvitationAction(formData: FormData) {
  const actor = await getActor()
  const id = z.uuid().parse(formData.get("id"))
  const invitation = (await listUserInvitations()).find(
    (item) => item.id === id
  )
  if (
    !invitation ||
    invitation.acceptedAt ||
    invitation.revokedAt ||
    invitation.expiresAt <= new Date()
  ) {
    throw new Error("This invitation is no longer active.")
  }
  const invitedUser = await getUserById(invitation.userId)
  if (!invitedUser) throw new Error("The invited account no longer exists.")
  const token = createToken()
  const expiresAt = new Date(Date.now() + invitationLifetimeMs)
  await sendInvitationEmail({
    email: invitation.email,
    name: invitation.name,
    locale: invitedUser.locale,
    token,
    expiresAt,
  })
  const updated = await replaceUserInvitationToken(
    id,
    hashToken(token),
    expiresAt,
    actor
  )
  if (!updated) throw new Error("The invitation could not be renewed.")
  revalidatePath("/[locale]/dashboard/users", "page")
}

export async function revokeUserInvitationAction(formData: FormData) {
  const actor = await getActor()
  const id = z.uuid().parse(formData.get("id"))
  const invitation = await revokeUserInvitation(id, actor)
  if (!invitation) throw new Error("This invitation is no longer active.")
  revalidatePath("/[locale]/dashboard/users", "page")
}

export async function acceptUserInvitationAction(formData: FormData) {
  const token = z.string().min(32).max(64).parse(formData.get("token"))
  const locale = z.enum(["ar", "en"]).parse(formData.get("locale"))
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    const next = `/${locale}/invite/accept?token=${encodeURIComponent(token)}`
    redirect(`/${locale}/login?next=${encodeURIComponent(next)}`)
  }
  const invitation = await getUserInvitationByTokenHash(hashToken(token))
  if (
    !invitation ||
    invitation.acceptedAt ||
    invitation.revokedAt ||
    invitation.expiresAt <= new Date()
  ) {
    throw new Error("This invitation is invalid, expired, or already used.")
  }
  if (
    invitation.userId !== session.user.id ||
    invitation.email !== session.user.email.toLowerCase()
  ) {
    throw new Error("Sign in with the email address that received this invitation.")
  }
  const accepted = await acceptUserInvitation(
    hashToken(token),
    {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    }
  )
  if (!accepted) throw new Error("This invitation is no longer active.")
  revalidatePath("/[locale]/dashboard/users", "page")
  redirect(`/${locale}/dashboard`)
}
