import { and, desc, eq } from "drizzle-orm"
import { getDatabase, schema } from "../index"
import { type AuditLogInput, writeAuditLog } from "../utils/audit-log"
import { normalizePagination } from "../utils/pagination"
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
  } = {},
  database = getDatabase()
) {
  const { limit, offset } = normalizePagination(options)

  return database
    .select()
    .from(schema.auditLogs)
    .where(
      and(
        options.actorId
          ? eq(schema.auditLogs.actorId, options.actorId)
          : undefined,
        options.entityType
          ? eq(schema.auditLogs.entityType, options.entityType)
          : undefined,
        options.entityId
          ? eq(schema.auditLogs.entityId, options.entityId)
          : undefined
      )
    )
    .orderBy(desc(schema.auditLogs.createdAt))
    .limit(limit)
    .offset(offset)
}
