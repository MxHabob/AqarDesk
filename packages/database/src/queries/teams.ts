import { and, asc, eq, isNull } from "drizzle-orm"
import { getDatabase, schema } from "../index"
import { writeAuditLog } from "../utils/audit-log"
import { withTransaction } from "../utils/database"
import type { DatabaseOrTransaction } from "./types"

export async function listTeams(database = getDatabase()) {
  return database
    .select()
    .from(schema.teams)
    .where(isNull(schema.teams.archivedAt))
    .orderBy(asc(schema.teams.name))
}

export async function listUserTeams(userId: string, database = getDatabase()) {
  return database
    .select({
      id: schema.teams.id,
      name: schema.teams.name,
    })
    .from(schema.teamMembers)
    .innerJoin(schema.teams, eq(schema.teamMembers.teamId, schema.teams.id))
    .where(
      and(
        eq(schema.teamMembers.userId, userId),
        isNull(schema.teams.archivedAt)
      )
    )
    .orderBy(asc(schema.teams.name))
}

export async function getTeamById(id: string, database = getDatabase()) {
  const [team] = await database
    .select()
    .from(schema.teams)
    .where(and(eq(schema.teams.id, id), isNull(schema.teams.archivedAt)))
    .limit(1)

  return team
}

export async function listTeamMembers(
  teamId: string,
  database = getDatabase()
) {
  return database
    .select({
      userId: schema.teamMembers.userId,
      name: schema.users.name,
      email: schema.users.email,
      image: schema.users.image,
      role: schema.teamMembers.role,
      assignedById: schema.teamMembers.assignedById,
      joinedAt: schema.teamMembers.joinedAt,
    })
    .from(schema.teamMembers)
    .innerJoin(schema.users, eq(schema.teamMembers.userId, schema.users.id))
    .where(eq(schema.teamMembers.teamId, teamId))
    .orderBy(asc(schema.users.name))
}

export async function createTeam(
  values: {
    name: string
    description?: string | null
    createdById: string
  },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [team] = await transaction
      .insert(schema.teams)
      .values(values)
      .returning()
    if (team) {
      await transaction.insert(schema.teamMembers).values({
        teamId: team.id,
        userId: values.createdById,
        role: "lead",
        assignedById: values.createdById,
      })
      await writeAuditLog(
        {
          actorId: values.createdById,
          action: "team.created",
          entityType: "team",
          entityId: team.id,
          after: { name: team.name, description: team.description },
        },
        transaction
      )
    }
    return team
  }, database)
}

export async function updateTeam(
  id: string,
  values: Partial<
    Pick<typeof schema.teams.$inferInsert, "name" | "description">
  >,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [before] = await transaction
      .select({
        name: schema.teams.name,
        description: schema.teams.description,
      })
      .from(schema.teams)
      .where(and(eq(schema.teams.id, id), isNull(schema.teams.archivedAt)))
      .limit(1)
    if (!before) return undefined

    const [team] = await transaction
      .update(schema.teams)
      .set({ ...values, updatedAt: new Date() })
      .where(and(eq(schema.teams.id, id), isNull(schema.teams.archivedAt)))
      .returning()

    if (team) {
      await writeAuditLog(
        {
          actorId: actor.id,
          actorName: actor.name,
          actorEmail: actor.email,
          action: "team.updated",
          entityType: "team",
          entityId: team.id,
          before,
          after: { name: team.name, description: team.description },
        },
        transaction
      )
    }

    return team
  }, database)
}

export async function setTeamMembers(
  teamId: string,
  members: Array<{ userId: string; role: "lead" | "member" }>,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [team] = await transaction
      .select({ id: schema.teams.id })
      .from(schema.teams)
      .where(and(eq(schema.teams.id, teamId), isNull(schema.teams.archivedAt)))
      .limit(1)
    if (!team) return undefined

    const previousMembers = await transaction
      .select({
        userId: schema.teamMembers.userId,
        role: schema.teamMembers.role,
      })
      .from(schema.teamMembers)
      .where(eq(schema.teamMembers.teamId, teamId))

    await transaction
      .delete(schema.teamMembers)
      .where(eq(schema.teamMembers.teamId, teamId))

    if (members.length > 0) {
      await transaction.insert(schema.teamMembers).values(
        members.map(({ userId, role }) => ({
          teamId,
          userId,
          role,
          assignedById: actor.id,
        }))
      )
    }

    await writeAuditLog(
      {
        actorId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: "team.members_updated",
        entityType: "team",
        entityId: teamId,
        before: { members: previousMembers },
        after: { members },
      },
      transaction
    )
  }, database)
}

export async function addTeamMember(
  teamId: string,
  userId: string,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [team] = await transaction
      .select({ id: schema.teams.id })
      .from(schema.teams)
      .where(and(eq(schema.teams.id, teamId), isNull(schema.teams.archivedAt)))
      .limit(1)
    if (!team) return undefined

    const [member] = await transaction
      .insert(schema.teamMembers)
      .values({
        teamId,
        userId,
        role: "member",
        assignedById: actor.id,
      })
      .onConflictDoNothing()
      .returning({ userId: schema.teamMembers.userId })
    if (!member) return undefined

    await writeAuditLog(
      {
        actorId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: "team.member_added",
        entityType: "team",
        entityId: teamId,
        after: { userId },
      },
      transaction
    )
    return member
  }, database)
}

export async function removeTeamMember(
  teamId: string,
  userId: string,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [member] = await transaction
      .select({ role: schema.teamMembers.role })
      .from(schema.teamMembers)
      .where(
        and(
          eq(schema.teamMembers.teamId, teamId),
          eq(schema.teamMembers.userId, userId)
        )
      )
      .limit(1)
    if (!member) return undefined
    if (member.role === "lead") {
      throw new Error("The team lead cannot be removed.")
    }

    const [removed] = await transaction
      .delete(schema.teamMembers)
      .where(
        and(
          eq(schema.teamMembers.teamId, teamId),
          eq(schema.teamMembers.userId, userId)
        )
      )
      .returning({ userId: schema.teamMembers.userId })
    if (!removed) return undefined

    await writeAuditLog(
      {
        actorId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: "team.member_removed",
        entityType: "team",
        entityId: teamId,
        before: { userId },
      },
      transaction
    )
    return removed
  }, database)
}

export async function archiveTeam(
  id: string,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [team] = await transaction
      .update(schema.teams)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(schema.teams.id, id), isNull(schema.teams.archivedAt)))
      .returning()

    if (team) {
      await writeAuditLog(
        {
          actorId: actor.id,
          actorName: actor.name,
          actorEmail: actor.email,
          action: "team.archived",
          entityType: "team",
          entityId: team.id,
          after: { archivedAt: team.archivedAt },
        },
        transaction
      )
    }

    return team
  }, database)
}
