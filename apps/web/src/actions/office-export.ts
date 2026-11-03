"use server"

import { auth } from "@aqardesk/auth/server"
import { getDatabase, schema } from "@aqardesk/database"
import { createReadUrl, uploadStorageObject } from "@aqardesk/storage/server"
import { headers } from "next/headers"
import { assertPermission, hasPermission } from "@/lib/auth/permissions"

export async function exportOfficeDataAction() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")

  const [canReadProperties, canReadListings, canReadOwners] = await Promise.all(
    [
      hasPermission(session.user.id, "properties.read"),
      hasPermission(session.user.id, "listings.read"),
      hasPermission(session.user.id, "owners.read"),
    ]
  )
  if (!canReadProperties && !canReadListings && !canReadOwners) {
    await assertPermission(session.user.id, "office_settings.read")
  }

  const database = getDatabase()
  const [properties, listings, owners] = await Promise.all([
    canReadProperties ? database.select().from(schema.properties) : [],
    canReadListings ? database.select().from(schema.listings) : [],
    canReadOwners ? database.select().from(schema.owners) : [],
  ])

  const exportData = {
    exportedAt: new Date().toISOString(),
    exportedBy: session.user.email,
    properties,
    listings,
    owners,
  }
  const fileName = `aqardesk-office-export-${new Date()
    .toISOString()
    .slice(0, 10)}.json`
  const objectKey = `exports/${session.user.id}/${crypto.randomUUID()}-${fileName}`
  const body = new TextEncoder().encode(JSON.stringify(exportData, null, 2))
  await uploadStorageObject({
    objectKey,
    contentType: "application/json",
    body,
  })
  const { url } = await createReadUrl(objectKey, {
    downloadFilename: fileName,
  })

  return {
    url,
    fileName,
    totalItems: properties.length + listings.length + owners.length,
  }
}
