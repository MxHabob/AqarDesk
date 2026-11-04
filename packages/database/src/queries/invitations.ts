import { and, desc, eq, gt, inArray, isNull, lte } from "drizzle-orm"
import { getDatabase, schema } from "../index"
import { setUserRoles } from "./access-control"
import { writeAuditLog } from "../utils/audit-log"
import { withTransaction } from "../utils/database"
import type { DatabaseOrTransaction } from "./types"

export async function listUserInvitations(database = getDatabase()) {
  const invitations = await database
    .select({
      id: schema.userInvitations.id,
      email: schema.userInvitations.email,
      name: schema.userInvitations.name,
      userId: schema.userInvitations.userId,
      invitedById: schema.userInvitations.invitedById,
      expiresAt: schema.userInvitations.expiresAt,
      acceptedAt: schema.userInvitations.acceptedAt,
      revokedAt: schema.userInvitations.revokedAt,
      createdAt: schema.userInvitations.createdAt,
    })
    .from(schema.userInvitations)
    .orderBy(desc(schema.userInvitations.createdAt))
    .limit(100)

  if (invitations.length === 0) return []
  const roles = await database
    .select({
      invitationId: schema.userInvitationRoles.invitationId,
      roleId: schema.userInvitationRoles.roleId,
      roleName: schema.roles.name,
    })
    .from(schema.userInvitationRoles)
    .innerJoin(
      schema.roles,
      eq(schema.userInvitationRoles.roleId, schema.roles.id)
    )
    .where(
      inArray(
        schema.userInvitationRoles.invitationId,
        invitations.map(({ id }) => id)
      )
    )

  const rolesByInvitation = new Map<
    string,
    Array<{ id: string; name: string }>
  >()
  for (const role of roles) {
    const assigned = rolesByInvitation.get(role.invitationId) ?? []
    assigned.push({ id: role.roleId, name: role.roleName })
    rolesByInvitation.set(role.invitationId, assigned)
  }
  return invitations.map((invitation) => ({
    ...invitation,
    roles: rolesByInvitation.get(invitation.id) ?? [],
  }))
}

export async function getUserInvitationByTokenHash(
  tokenHash: string,
  database = getDatabase()
) {
  const [invitation] = await database
    .select({
      id: schema.userInvitations.id,
      email: schema.userInvitations.email,
      name: schema.userInvitations.name,
      userId: schema.userInvitations.userId,
      expiresAt: schema.userInvitations.expiresAt,
      acceptedAt: schema.userInvitations.acceptedAt,
      revokedAt: schema.userInvitations.revokedAt,
    })
    .from(schema.userInvitations)
    .where(eq(schema.userInvitations.tokenHash, tokenHash))
    .limit(1)

  if (!invitation) return undefined
  const roleRows = await database
    .select({ roleId: schema.userInvitationRoles.roleId })
    .from(schema.userInvitationRoles)
    .where(eq(schema.userInvitationRoles.invitationId, invitation.id))
  return { ...invitation, roleIds: roleRows.map(({ roleId }) => roleId) }
}

export async function createUserInvitation(
  input: {
    email: string
    name: string
    userId: string
    tokenHash: string
    roleIds: string[]
    expiresAt: Date
  },
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const now = new Date()
    await transaction
      .update(schema.userInvitations)
      .set({ revokedAt: now })
      .where(
        and(
          eq(schema.userInvitations.email, input.email),
          isNull(schema.userInvitations.acceptedAt),
          isNull(schema.userInvitations.revokedAt),
          lte(schema.userInvitations.expiresAt, now)
        )
      )
    const [invitation] = await transaction
      .insert(schema.userInvitations)
      .values({
        email: input.email,
        name: input.name,
        userId: input.userId,
        tokenHash: input.tokenHash,
        invitedById: actor.id,
        expiresAt: input.expiresAt,
      })
      .returning({
        id: schema.userInvitations.id,
        email: schema.userInvitations.email,
        name: schema.userInvitations.name,
        expiresAt: schema.userInvitations.expiresAt,
      })
    if (!invitation) throw new Error("The invitation could not be created.")
    await transaction.insert(schema.userInvitationRoles).values(
      [...new Set(input.roleIds)].map((roleId) => ({
        invitationId: invitation.id,
        roleId,
      }))
    )
    await writeAuditLog(
      {
        actorId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: "user_invitation.created",
        entityType: "user",
        entityId: input.userId,
        after: { email: input.email, roleIds: [...new Set(input.roleIds)] },
      },
      transaction
    )
    return invitation
  }, database)
}

export async function replaceUserInvitationToken(
  id: string,
  tokenHash: string,
  expiresAt: Date,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [invitation] = await transaction
      .update(schema.userInvitations)
      .set({ tokenHash, expiresAt })
      .where(
        and(
          eq(schema.userInvitations.id, id),
          isNull(schema.userInvitations.acceptedAt),
          isNull(schema.userInvitations.revokedAt)
        )
      )
      .returning({
        id: schema.userInvitations.id,
        email: schema.userInvitations.email,
        name: schema.userInvitations.name,
        userId: schema.userInvitations.userId,
        expiresAt: schema.userInvitations.expiresAt,
      })
    if (!invitation) return undefined
    await writeAuditLog(
      {
        actorId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: "user_invitation.resent",
        entityType: "user",
        entityId: invitation.userId,
        metadata: { invitationId: id, expiresAt },
      },
      transaction
    )
    return invitation
  }, database)
}

export async function revokeUserInvitation(
  id: string,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [invitation] = await transaction
      .update(schema.userInvitations)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(schema.userInvitations.id, id),
          isNull(schema.userInvitations.acceptedAt),
          isNull(schema.userInvitations.revokedAt)
        )
      )
      .returning({
        id: schema.userInvitations.id,
        email: schema.userInvitations.email,
        userId: schema.userInvitations.userId,
      })
    if (!invitation) return undefined
    await writeAuditLog(
      {
        actorId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: "user_invitation.revoked",
        entityType: "user",
        entityId: invitation.userId,
        before: { email: invitation.email },
      },
      transaction
    )
    return invitation
  }, database)
}

export async function acceptUserInvitation(
  tokenHash: string,
  user: { id: string; name?: string | null; email: string },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [invitation] = await transaction
      .update(schema.userInvitations)
      .set({ acceptedAt: new Date() })
      .where(
        and(
          eq(schema.userInvitations.tokenHash, tokenHash),
          eq(schema.userInvitations.userId, user.id),
          eq(schema.userInvitations.email, user.email.toLowerCase()),
          isNull(schema.userInvitations.acceptedAt),
          isNull(schema.userInvitations.revokedAt),
          gt(schema.userInvitations.expiresAt, new Date())
        )
      )
      .returning({
        id: schema.userInvitations.id,
        userId: schema.userInvitations.userId,
      })
    if (!invitation) return false
    const roleRows = await transaction
      .select({ roleId: schema.userInvitationRoles.roleId })
      .from(schema.userInvitationRoles)
      .where(eq(schema.userInvitationRoles.invitationId, invitation.id))
    await setUserRoles(
      user.id,
      roleRows.map(({ roleId }) => roleId),
      user,
      transaction
    )
    await writeAuditLog(
      {
        actorId: user.id,
        actorName: user.name,
        actorEmail: user.email,
        action: "user_invitation.accepted",
        entityType: "user",
        entityId: user.id,
        after: { invitationId: invitation.id },
      },
      transaction
    )
    return true
  }, database)
}
