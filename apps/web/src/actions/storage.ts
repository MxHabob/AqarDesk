"use server"

import { auth } from "@aqardesk/auth/server"
import {
  createReadUrl,
  createUploadUrl,
  deleteStorageObject,
  verifyUploadedObject,
} from "@aqardesk/storage/server"
import { headers } from "next/headers"
import { z } from "zod"
import { assertPermission, hasPermission } from "@/lib/auth/permissions"

const uploadSchema = z.object({
  bucket: z.enum(["avatars", "apps", "vault"]),
  path: z.array(z.string().min(1).max(200)).max(12),
  fileName: z.string().min(1).max(255),
  contentType: z.string(),
  sizeBytes: z.number().int().positive(),
})

const contentTypeSchema = z.enum([
  "image/avif",
  "image/heic",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/json",
  "application/zip",
  "text/csv",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "video/mp4",
  "video/quicktime",
])

function safeFilename(filename: string) {
  const cleaned = filename
    .normalize("NFKC")
    .replace(/[^\w.-]+/g, "_")
    .replace(/^\.+/, "")
    .slice(-120)

  if (!cleaned || cleaned === "." || cleaned === "..") {
    throw new Error("A valid file name is required.")
  }
  return cleaned
}

async function getActor() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")
  return session.user
}

function objectKeyForUserUpload(
  userId: string,
  input: z.infer<typeof uploadSchema>
) {
  const name = safeFilename(input.fileName)
  const suffix = crypto.randomUUID()
  const requestedPath = input.path.filter(
    (segment) => segment !== userId && segment !== "office"
  )

  if (input.bucket === "avatars" && input.path[0] === "office") {
    return `office/default/logo/${suffix}-${name}`
  }
  if (input.bucket === "avatars") {
    return `users/${userId}/avatars/${suffix}-${name}`
  }
  if (input.bucket === "apps") {
    return `users/${userId}/app-logos/${suffix}-${name}`
  }
  const folders = requestedPath.map(safeFilename)
  const directory = folders.length > 0 ? `${folders.join("/")}/` : ""
  return `users/${userId}/files/${directory}${suffix}-${name}`
}

async function assertCanAccessObject(userId: string, objectKey: string) {
  if (objectKey.startsWith(`users/${userId}/`)) return
  if (/^users\/[^/]+\/avatars\//.test(objectKey)) return
  if (objectKey.startsWith("office/default/")) {
    await assertPermission(userId, "office_settings.read")
    return
  }
  if (objectKey.startsWith(`exports/${userId}/`)) {
    const canExport = await Promise.all([
      hasPermission(userId, "properties.read"),
      hasPermission(userId, "listings.read"),
      hasPermission(userId, "owners.read"),
    ])
    if (!canExport.some(Boolean)) {
      await assertPermission(userId, "office_settings.read")
    }
    return
  }
  if (objectKey.startsWith("listings/")) {
    await assertPermission(userId, "listings.read")
    return
  }
  throw new Error("You do not have permission to access this file.")
}

export async function createAppUploadUrlAction(input: unknown) {
  const values = uploadSchema.parse(input)
  const actor = await getActor()
  if (values.bucket === "avatars" && values.path[0] === "office") {
    await assertPermission(actor.id, "office_settings.manage")
  }

  const contentType = contentTypeSchema.parse(values.contentType)
  const objectKey = objectKeyForUserUpload(actor.id, values)

  return createUploadUrl({
    objectKey,
    contentType,
    sizeBytes: values.sizeBytes,
  })
}

export async function verifyAppUploadAction(input: {
  objectKey: string
  contentType: string
  sizeBytes: number
}) {
  const actor = await getActor()
  const objectKey = z.string().min(1).max(1024).parse(input.objectKey)
  await assertCanAccessObject(actor.id, objectKey)

  const verified = await verifyUploadedObject({
    objectKey,
    expectedContentType: contentTypeSchema.parse(input.contentType),
    expectedSizeBytes: z.number().int().positive().parse(input.sizeBytes),
  })
  return { objectKey, ...verified }
}

export async function getStorageReadUrlAction(input: {
  objectKey: string
  downloadFilename?: string
}) {
  const actor = await getActor()
  const objectKey = z.string().min(1).max(1024).parse(input.objectKey)
  await assertCanAccessObject(actor.id, objectKey)
  const downloadFilename =
    input.downloadFilename === undefined
      ? undefined
      : safeFilename(z.string().min(1).max(255).parse(input.downloadFilename))
  return createReadUrl(objectKey, { downloadFilename })
}

export async function getStorageReadUrlsAction(objectKeysInput: string[]) {
  const actor = await getActor()
  const objectKeys = z.array(z.string().min(1).max(1024)).max(100).parse(objectKeysInput)
  await Promise.all(
    objectKeys.map((objectKey) => assertCanAccessObject(actor.id, objectKey))
  )
  return Promise.all(objectKeys.map((objectKey) => createReadUrl(objectKey)))
}

export async function deleteUserStorageObjectAction(objectKeyInput: string) {
  const actor = await getActor()
  const objectKey = z.string().min(1).max(1024).parse(objectKeyInput)
  if (
    !objectKey.startsWith(`users/${actor.id}/`) &&
    !objectKey.startsWith(`exports/${actor.id}/`)
  ) {
    if (objectKey.startsWith("office/default/")) {
      await assertPermission(actor.id, "office_settings.manage")
    } else {
      throw new Error("You do not have permission to delete this file.")
    }
  }
  await deleteStorageObject(objectKey)
}
