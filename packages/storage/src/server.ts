import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const MiB = 1024 * 1024
const uploadUrlLifetimeSeconds = 5 * 60
const readUrlLifetimeSeconds = 5 * 60
export const storageProvider = "s3-compatible"

const maximumBytesByType = new Map([
  ["image/avif", 20 * MiB],
  ["image/heic", 20 * MiB],
  ["image/jpeg", 20 * MiB],
  ["image/png", 20 * MiB],
  ["image/webp", 20 * MiB],
  ["application/pdf", 25 * MiB],
  ["application/json", 25 * MiB],
  ["application/zip", 100 * MiB],
  ["text/csv", 25 * MiB],
  ["text/plain", 10 * MiB],
  [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    25 * MiB,
  ],
  ["application/vnd.ms-excel", 25 * MiB],
  ["video/mp4", 250 * MiB],
  ["video/quicktime", 250 * MiB],
])

type StorageConfig = {
  bucket: string
  region: string
  endpoint?: string
  forcePathStyle: boolean
}

type UploadContentType =
  | "image/avif"
  | "image/heic"
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "application/pdf"
  | "application/json"
  | "application/zip"
  | "text/csv"
  | "text/plain"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/vnd.ms-excel"
  | "video/mp4"
  | "video/quicktime"

export type StorageUploadContentType = UploadContentType
export type StoragePresignedUpload = PresignedUpload

type ListingMediaKind = "photo" | "floor-plan" | "video" | "document"

type PresignedUpload = {
  url: string
  method: "PUT"
  headers: {
    "Content-Type": UploadContentType
  }
  expiresInSeconds: number
  objectKey: string
}

type VerifiedUpload = {
  contentType: string
  sizeBytes: number
}

const globalForStorage = globalThis as typeof globalThis & {
  s3Client?: S3Client
}

function getStorageConfig(): StorageConfig {
  const bucket = process.env.STORAGE_BUCKET

  if (!bucket) {
    throw new Error("STORAGE_BUCKET is required to use object storage.")
  }

  const endpoint = process.env.STORAGE_ENDPOINT
  const region = process.env.STORAGE_REGION || "auto"
  const configuredPathStyle = process.env.STORAGE_FORCE_PATH_STYLE

  if (
    Boolean(process.env.STORAGE_ACCESS_KEY_ID) !==
    Boolean(process.env.STORAGE_SECRET_ACCESS_KEY)
  ) {
    throw new Error(
      "STORAGE_ACCESS_KEY_ID and STORAGE_SECRET_ACCESS_KEY must be configured together."
    )
  }

  if (
    endpoint &&
    (!process.env.STORAGE_ACCESS_KEY_ID ||
      !process.env.STORAGE_SECRET_ACCESS_KEY)
  ) {
    throw new Error(
      "STORAGE_ACCESS_KEY_ID and STORAGE_SECRET_ACCESS_KEY are required with a custom storage endpoint."
    )
  }

  if (
    configuredPathStyle !== undefined &&
    configuredPathStyle !== "" &&
    configuredPathStyle !== "true" &&
    configuredPathStyle !== "false"
  ) {
    throw new Error("STORAGE_FORCE_PATH_STYLE must be true or false.")
  }

  return {
    bucket,
    region,
    endpoint,
    forcePathStyle:
      configuredPathStyle === undefined
        ? Boolean(endpoint)
        : configuredPathStyle === "true",
  }
}

function getS3Client() {
  if (globalForStorage.s3Client) {
    return globalForStorage.s3Client
  }

  const config = getStorageConfig()
  const client = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials:
      process.env.STORAGE_ACCESS_KEY_ID && process.env.STORAGE_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
            secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
          }
        : undefined,
  })

  globalForStorage.s3Client = client
  return client
}

function validateObjectKey(objectKey: string) {
  if (
    !objectKey ||
    objectKey.startsWith("/") ||
    objectKey.includes("\\") ||
    objectKey
      .split("/")
      .some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new Error("A valid relative object key is required.")
  }
}

function getMaximumUploadBytes(contentType: string) {
  const maximumBytes = maximumBytesByType.get(contentType)

  if (!maximumBytes) {
    throw new Error(`Unsupported upload content type: ${contentType}`)
  }

  return maximumBytes
}

export function createListingMediaObjectKey(
  listingId: string,
  kind: ListingMediaKind
) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      listingId
    )
  ) {
    throw new Error("A valid listing UUID is required.")
  }

  return `listings/${listingId}/${kind}/${crypto.randomUUID()}`
}

export async function createUploadUrl(input: {
  objectKey: string
  contentType: UploadContentType
  sizeBytes: number
}): Promise<PresignedUpload> {
  validateObjectKey(input.objectKey)

  if (
    !Number.isSafeInteger(input.sizeBytes) ||
    input.sizeBytes < 1 ||
    input.sizeBytes > getMaximumUploadBytes(input.contentType)
  ) {
    throw new Error("The requested upload size is outside the allowed limit.")
  }

  const config = getStorageConfig()
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: input.objectKey,
    ContentType: input.contentType,
    CacheControl: "private, no-store",
  })
  const url = await getSignedUrl(getS3Client(), command, {
    expiresIn: uploadUrlLifetimeSeconds,
  })

  return {
    url,
    method: "PUT",
    headers: {
      "Content-Type": input.contentType,
    },
    expiresInSeconds: uploadUrlLifetimeSeconds,
    objectKey: input.objectKey,
  }
}

export async function verifyUploadedObject(input: {
  objectKey: string
  expectedContentType: UploadContentType
  expectedSizeBytes: number
}): Promise<VerifiedUpload> {
  validateObjectKey(input.objectKey)

  if (
    !Number.isSafeInteger(input.expectedSizeBytes) ||
    input.expectedSizeBytes < 1 ||
    input.expectedSizeBytes > getMaximumUploadBytes(input.expectedContentType)
  ) {
    throw new Error("The uploaded object size is outside the allowed limit.")
  }

  const { bucket } = getStorageConfig()
  const result = await getS3Client().send(
    new HeadObjectCommand({
      Bucket: bucket,
      Key: input.objectKey,
    })
  )

  if (
    result.ContentType !== input.expectedContentType ||
    result.ContentLength !== input.expectedSizeBytes
  ) {
    await deleteStorageObject(input.objectKey)
    throw new Error(
      "The uploaded object does not match the expected content type and size."
    )
  }

  if (!result.ContentType || result.ContentLength === undefined) {
    throw new Error("The storage provider returned incomplete object metadata.")
  }

  return {
    contentType: result.ContentType,
    sizeBytes: result.ContentLength,
  }
}

export async function createReadUrl(
  objectKey: string,
  options?: { downloadFilename?: string }
) {
  validateObjectKey(objectKey)

  const { bucket } = getStorageConfig()
  const downloadFilename = options?.downloadFilename
    ?.replace(/["\\\r\n]/g, "_")
    .slice(0, 255)
  const url = await getSignedUrl(
    getS3Client(),
    new GetObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ...(downloadFilename
        ? {
            ResponseContentDisposition: `attachment; filename="${downloadFilename}"; filename*=UTF-8''${encodeURIComponent(downloadFilename)}`,
          }
        : {}),
    }),
    { expiresIn: readUrlLifetimeSeconds }
  )

  return { url, expiresInSeconds: readUrlLifetimeSeconds }
}

export async function uploadStorageObject(input: {
  objectKey: string
  contentType: UploadContentType
  body: Uint8Array
}) {
  validateObjectKey(input.objectKey)
  const maximumBytes = getMaximumUploadBytes(input.contentType)

  if (input.body.byteLength < 1 || input.body.byteLength > maximumBytes) {
    throw new Error("The object size is outside the allowed limit.")
  }

  const { bucket } = getStorageConfig()
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: input.objectKey,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: "private, no-store",
    })
  )

  return { objectKey: input.objectKey, sizeBytes: input.body.byteLength }
}

export async function deleteStorageObject(objectKey: string) {
  validateObjectKey(objectKey)

  const { bucket } = getStorageConfig()
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    })
  )
}

export function closeStorageClient() {
  globalForStorage.s3Client?.destroy()
  delete globalForStorage.s3Client
}
