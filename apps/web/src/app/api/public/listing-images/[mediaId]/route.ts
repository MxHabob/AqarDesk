import { getDatabase, schema } from "@aqardesk/database"
import { createReadUrl } from "@aqardesk/storage/server"
import { and, eq, gt, isNull, or } from "drizzle-orm"
import { z } from "zod"

const mediaIdSchema = z.uuid()

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  const { mediaId } = await params
  const parsedMediaId = mediaIdSchema.safeParse(mediaId)
  if (!parsedMediaId.success) {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    })
  }

  const [media] = await getDatabase()
    .select({
      objectKey: schema.listingMedia.objectKey,
      contentType: schema.listingMedia.contentType,
    })
    .from(schema.listingMedia)
    .innerJoin(
      schema.listings,
      eq(schema.listingMedia.listingId, schema.listings.id)
    )
    .innerJoin(
      schema.properties,
      eq(schema.listings.propertyId, schema.properties.id)
    )
    .where(
      and(
        eq(schema.listingMedia.id, parsedMediaId.data),
        eq(schema.listingMedia.type, "photo"),
        eq(schema.listings.status, "active"),
        isNull(schema.properties.archivedAt),
        or(
          isNull(schema.listings.expiresAt),
          gt(schema.listings.expiresAt, new Date())
        )
      )
    )
    .limit(1)

  if (!media) {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    })
  }

  if (
    !["image/avif", "image/jpeg", "image/png", "image/webp"].includes(
      media.contentType ?? ""
    )
  ) {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    })
  }

  const { url } = await createReadUrl(media.objectKey)
  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      "Cache-Control":
        "public, max-age=0, s-maxage=60, stale-while-revalidate=120",
    },
  })
}
