import { and, desc, eq, gt, lt } from "drizzle-orm"
import { getDatabase, schema } from "../index"
import { writeAuditLog } from "../utils/audit-log"
import { withTransaction } from "../utils/database"
import type { DatabaseOrTransaction } from "./types"

export async function listUserSessions(
  userId: string,
  database = getDatabase()
) {
  return database
    .select({
      id: schema.sessions.id,
      expiresAt: schema.sessions.expiresAt,
      createdAt: schema.sessions.createdAt,
      updatedAt: schema.sessions.updatedAt,
      ipAddress: schema.sessions.ipAddress,
      userAgent: schema.sessions.userAgent,
    })
    .from(schema.sessions)
    .where(
      and(
        eq(schema.sessions.userId, userId),
        gt(schema.sessions.expiresAt, new Date())
      )
    )
    .orderBy(desc(schema.sessions.createdAt))
}

export async function revokeUserSession(
  sessionId: string,
  userId: string,
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [session] = await transaction
      .delete(schema.sessions)
      .where(
        and(
          eq(schema.sessions.id, sessionId),
          eq(schema.sessions.userId, userId)
        )
      )
      .returning({ id: schema.sessions.id })

    if (session) {
      await writeAuditLog(
        {
          actorId: userId,
          action: "session.revoked",
          entityType: "user",
          entityId: userId,
          metadata: { sessionId },
        },
        transaction
      )
    }

    return session
  }, database)
}

export async function deleteExpiredSessions(
  now = new Date(),
  database: DatabaseOrTransaction = getDatabase()
) {
  const deleted = await database
    .delete(schema.sessions)
    .where(lt(schema.sessions.expiresAt, now))
    .returning({ id: schema.sessions.id })

  return deleted.length
}
