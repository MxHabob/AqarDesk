import { getDatabase, schema } from "../index"
import type { DatabaseOrTransaction } from "../queries/types"

export type AuditLogInput = {
  actorId?: string | null
  actorName?: string | null
  actorEmail?: string | null
  action: string
  entityType: string
  entityId?: string | null
  before?: Record<string, unknown> | null
  after?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null
  ipAddress?: string | null
  userAgent?: string | null
}

export function writeAuditLog(
  input: AuditLogInput,
  database: DatabaseOrTransaction = getDatabase()
) {
  return database.insert(schema.auditLogs).values({
    ...input,
    actorId: input.actorId ?? null,
    actorName: input.actorName ?? null,
    actorEmail: input.actorEmail ?? null,
    entityId: input.entityId ?? null,
    before: input.before ?? null,
    after: input.after ?? null,
    metadata: input.metadata ?? null,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
  })
}
