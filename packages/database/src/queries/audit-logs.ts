import { and, count, desc, eq, ilike, or } from "drizzle-orm"
import { getDatabase, schema } from "../index"
import { type AuditLogInput, writeAuditLog } from "../utils/audit-log"
import { normalizePagination } from "../utils/pagination"
import { escapeLikePattern } from "../utils/search"
import type { DatabaseOrTransaction } from "./types"

export async function createAuditLog(
  input: AuditLogInput,
  database: DatabaseOrTransaction = getDatabase()
) {
  const [record] = await writeAuditLog(input, database)
  return record
}

export async function listAuditLogs(
  options: {
    page?: number
    pageSize?: number
    actorId?: string
    entityType?: string
    entityId?: string
    query?: string
  } = {},
  database = getDatabase()
) {
  const { limit, offset } = normalizePagination(options)
  const query = options.query?.trim()
  const where = and(
    options.actorId ? eq(schema.auditLogs.actorId, options.actorId) : undefined,
    options.entityType
      ? eq(schema.auditLogs.entityType, options.entityType)
      : undefined,
    options.entityId
      ? eq(schema.auditLogs.entityId, options.entityId)
      : undefined,
    query
      ? or(
          ilike(schema.auditLogs.action, `%${escapeLikePattern(query)}%`),
          ilike(schema.auditLogs.entityType, `%${escapeLikePattern(query)}%`),
          ilike(schema.auditLogs.entityId, `%${escapeLikePattern(query)}%`),
          ilike(schema.auditLogs.actorName, `%${escapeLikePattern(query)}%`),
          ilike(schema.auditLogs.actorEmail, `%${escapeLikePattern(query)}%`)
        )
      : undefined
  )

  const [totalRows, rows] = await Promise.all([
    database.select({ total: count() }).from(schema.auditLogs).where(where),
    database
      .select()
      .from(schema.auditLogs)
      .where(where)
      .orderBy(desc(schema.auditLogs.createdAt))
      .limit(limit)
      .offset(offset),
  ])
  return { rows, total: totalRows[0]?.total ?? 0 }
}
