import { and, desc, eq, gt, isNull } from "drizzle-orm"
import { getDatabase, schema } from "../index"
import { writeAuditLog } from "../utils/audit-log"
import { withTransaction } from "../utils/database"
import {
  createShortLinkToken,
  getShortLinkExpiration,
  hashShortLinkToken,
} from "../utils/short-link"
import type { DatabaseOrTransaction } from "./types"

export type ShortLinkResource = {
  resourceType: string
  resourceId: string
}

export async function createShortLink(
  input: ShortLinkResource & {
    createdById: string
    actorName?: string | null
    actorEmail?: string | null
    expiresAt?: Date
    lifetimeDays?: number
  },
  database: DatabaseOrTransaction = getDatabase()
) {
  const resourceType = input.resourceType.trim()
  const resourceId = input.resourceId.trim()
  if (!/^[a-z][a-z0-9_]{0,63}$/.test(resourceType)) {
    throw new TypeError("Short link resource type is invalid.")
  }
  if (!resourceId || resourceId.length > 200) {
    throw new TypeError("Short link resource ID is invalid.")
  }

  const token = createShortLinkToken()
  const tokenHash = hashShortLinkToken(token)
  const expiresAt =
    input.expiresAt ?? getShortLinkExpiration(new Date(), input.lifetimeDays)
  if (expiresAt <= new Date()) {
    throw new RangeError("Short link expiration must be in the future.")
  }

  const shortLink = await withTransaction(async (transaction) => {
    const [created] = await transaction
      .insert(schema.shortLinks)
      .values({
        resourceType,
        resourceId,
        tokenHash,
        createdById: input.createdById,
        expiresAt,
      })
      .returning({
        id: schema.shortLinks.id,
        resourceType: schema.shortLinks.resourceType,
        resourceId: schema.shortLinks.resourceId,
        expiresAt: schema.shortLinks.expiresAt,
        createdAt: schema.shortLinks.createdAt,
      })

    if (!created) {
      throw new Error("Short link creation did not return a record.")
    }

    await writeAuditLog(
      {
        actorId: input.createdById,
        actorName: input.actorName,
        actorEmail: input.actorEmail,
        action: "short_link.created",
        entityType: resourceType,
        entityId: resourceId,
        metadata: { shortLinkId: created.id, expiresAt },
      },
      transaction
    )

    return created
  }, database)

  return { ...shortLink, token }
}

export async function resolveShortLink(
  token: string,
  database = getDatabase()
) {
  if (!/^[A-Za-z0-9_-]{40,50}$/.test(token)) return undefined

  const [shortLink] = await database
    .select({
      id: schema.shortLinks.id,
      resourceType: schema.shortLinks.resourceType,
      resourceId: schema.shortLinks.resourceId,
      expiresAt: schema.shortLinks.expiresAt,
    })
    .from(schema.shortLinks)
    .where(
      and(
        eq(schema.shortLinks.tokenHash, hashShortLinkToken(token)),
        isNull(schema.shortLinks.revokedAt),
        gt(schema.shortLinks.expiresAt, new Date())
      )
    )
    .limit(1)

  return shortLink
}

export async function listShortLinks(
  resource: ShortLinkResource,
  database = getDatabase()
) {
  return database
    .select({
      id: schema.shortLinks.id,
      resourceType: schema.shortLinks.resourceType,
      resourceId: schema.shortLinks.resourceId,
      createdById: schema.shortLinks.createdById,
      expiresAt: schema.shortLinks.expiresAt,
      revokedAt: schema.shortLinks.revokedAt,
      createdAt: schema.shortLinks.createdAt,
    })
    .from(schema.shortLinks)
    .where(
      and(
        eq(schema.shortLinks.resourceType, resource.resourceType),
        eq(schema.shortLinks.resourceId, resource.resourceId)
      )
    )
    .orderBy(desc(schema.shortLinks.createdAt))
}

export async function revokeShortLink(
  id: string,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [shortLink] = await transaction
      .update(schema.shortLinks)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(schema.shortLinks.id, id), isNull(schema.shortLinks.revokedAt))
      )
      .returning({
        id: schema.shortLinks.id,
        resourceType: schema.shortLinks.resourceType,
        resourceId: schema.shortLinks.resourceId,
      })

    if (!shortLink) return undefined

    await writeAuditLog(
      {
        actorId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: "short_link.revoked",
        entityType: shortLink.resourceType,
        entityId: shortLink.resourceId,
        metadata: { shortLinkId: shortLink.id },
      },
      transaction
    )

    return shortLink
  }, database)
}
