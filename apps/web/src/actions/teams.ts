"use server"

import { auth } from "@aqardesk/auth/server"
import { listUserTeams } from "@aqardesk/database/queries"
import { cookies, headers } from "next/headers"
import { z } from "zod"

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
