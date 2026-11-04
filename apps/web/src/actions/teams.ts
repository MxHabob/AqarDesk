"use server"

import { auth } from "@aqardesk/auth/server"
import {
  addTeamMember,
  archiveTeam,
  createTeam,
  getTeamById,
  getUserById,
  listUserTeams,
  removeTeamMember,
} from "@aqardesk/database/queries"
import { revalidatePath } from "next/cache"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { assertPermission } from "@/lib/auth/permissions"
import { getRoleDestination, getUserRoleKeys } from "@/lib/auth/roles"

const activeTeamCookie = "AqarDesk-Active-Team"

export async function getUserTeamsAction() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")

  const teams = await listUserTeams(session.user.id)
  const cookieStore = await cookies()
  const activeTeamId = cookieStore.get(activeTeamCookie)?.value
  const selectedTeamId = teams.some((team) => team.id === activeTeamId)
    ? activeTeamId
    : teams[0]?.id

  return {
    teams: teams.map((team) => ({ ...team, logoUrl: null })),
    selectedTeamId,
  }
}

export async function switchActiveTeamAction(teamId: string) {
  const parsedTeamId = z.uuid().parse(teamId)
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")

  const teams = await listUserTeams(session.user.id)
  if (!teams.some((team) => team.id === parsedTeamId)) {
    throw new Error("Forbidden")
  }

  const cookieStore = await cookies()
  cookieStore.set(activeTeamCookie, parsedTeamId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return { selectedTeamId: parsedTeamId }
}

export async function viewTeamFromAccountAction(formData: FormData) {
  const { teamId, locale } = z
    .object({ teamId: z.uuid(), locale: z.enum(["ar", "en"]) })
    .parse({
      teamId: formData.get("teamId"),
      locale: formData.get("locale"),
    })

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")

  await switchActiveTeamAction(teamId)
  const destination = getRoleDestination(
    await getUserRoleKeys(session.user.id),
    locale
  )
  if (!destination) redirect(`/${locale}/login?error=role`)
  redirect(
    destination === `/${locale}/dashboard`
      ? destination
      : `/${locale}/account/teams`
  )
}

export async function archiveActiveTeamAction() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")
  await assertPermission(session.user.id, "teams.manage")

  const teams = await listUserTeams(session.user.id)
  const cookieStore = await cookies()
  const activeTeamId = cookieStore.get(activeTeamCookie)?.value
  const teamId = teams.some((team) => team.id === activeTeamId)
    ? activeTeamId
    : teams[0]?.id
  if (!teamId) throw new Error("No active team is available to archive.")

  const team = await getTeamById(teamId)
  if (!team) throw new Error("Team was not found.")

  const archived = await archiveTeam(team.id, {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  })
  if (!archived) throw new Error("Team could not be archived.")

  cookieStore.delete(activeTeamCookie)
  return { id: archived.id }
}

export async function createTeamAction(formData: FormData) {
  const { name } = z
    .object({ name: z.string().trim().min(1).max(100) })
    .parse({ name: formData.get("name") })
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")
  await assertPermission(session.user.id, "teams.manage")

  const team = await createTeam({
    name,
    createdById: session.user.id,
  })
  if (!team) throw new Error("Team could not be created.")

  const cookieStore = await cookies()
  cookieStore.set(activeTeamCookie, team.id, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  revalidatePath("/[locale]/dashboard/teams", "page")
  revalidatePath("/[locale]/dashboard/settings/members", "page")
}

export async function addTeamMemberAction(formData: FormData) {
  const { teamId, userId } = z
    .object({ teamId: z.uuid(), userId: z.string().trim().min(1) })
    .parse({
      teamId: formData.get("teamId"),
      userId: formData.get("userId"),
    })
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")
  await assertPermission(session.user.id, "teams.manage")

  const teams = await listUserTeams(session.user.id)
  if (!teams.some((team) => team.id === teamId)) {
    throw new Error("Forbidden")
  }

  const user = await getUserById(userId)
  if (!user) throw new Error("The selected account does not exist.")
  const added = await addTeamMember(teamId, userId, {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  })
  if (!added) {
    throw new Error(
      "The account is already a team member or the team is unavailable."
    )
  }

  revalidatePath("/[locale]/dashboard/settings/members", "page")
}

export async function removeTeamMemberAction(formData: FormData) {
  const { teamId, userId } = z
    .object({ teamId: z.uuid(), userId: z.string().trim().min(1) })
    .parse({
      teamId: formData.get("teamId"),
      userId: formData.get("userId"),
    })
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")
  await assertPermission(session.user.id, "teams.manage")

  const teams = await listUserTeams(session.user.id)
  if (!teams.some((team) => team.id === teamId)) {
    throw new Error("Forbidden")
  }

  const removed = await removeTeamMember(teamId, userId, {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  })
  if (!removed) throw new Error("The selected account is not a team member.")

  revalidatePath("/[locale]/dashboard/settings/members", "page")
}
