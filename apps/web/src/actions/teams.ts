"use server"

import { auth } from "@aqardesk/auth/server"
import {
  archiveTeam,
  getTeamById,
  listUserTeams,
} from "@aqardesk/database/queries"
import { cookies, headers } from "next/headers"
import { z } from "zod"
import { assertPermission } from "@/lib/auth/permissions"

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
