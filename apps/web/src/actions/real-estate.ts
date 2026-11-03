"use server"

import { auth } from "@aqardesk/auth/server"
import { getDatabase, schema } from "@aqardesk/database"
import type {
  DatabaseTransaction,
  PropertyDetailsInput,
} from "@aqardesk/database/queries"
import {
  createListing,
  createListingMedia,
  createOwner,
  createProperty,
  createShortLink,
  deleteListingMedia,
  getListingById,
  getOwnerById,
  getPropertyById,
  getPropertyDetails,
  getPublicListingById,
  listListingMedia,
  listListings,
  listOwners,
  listProperties,
  savePropertyDetails,
  setOwnerPhones,
  setPropertyOwners,
  updateListing,
  updateOwner,
  updateProperty,
} from "@aqardesk/database/queries"
import {
  createListingMediaObjectKey,
  createUploadUrl,
  storageProvider,
  verifyUploadedObject,
} from "@aqardesk/storage/server"
import { and, eq, gt, isNull, or } from "drizzle-orm"
import { headers } from "next/headers"
import { z } from "zod"
import { assertPermission } from "@/lib/auth/permissions"

export type FormActionState = {
  error?: string
  saved?: boolean
  id?: string
}

const emptyState: FormActionState = {}
const idSchema = z.uuid()
const propertyTypeSchema = z.enum([
  "building",
  "land",
  "house_villa",
  "investment",
  "commercial",
  "warehouse",
  "yard",
  "apartment",
])

async function getActor() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")
  return session.user
}

function readText(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function nullableText(value: string) {
  return value || null
}

function readOptionalNumber(formData: FormData, key: string) {
  const value = readText(formData, key)
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

export async function getPropertyFormData(id: string) {
  const actor = await getActor()
  await assertPermission(actor.id, "properties.read")
  const parsedId = idSchema.parse(id)
  const property = await getPropertyById(parsedId)
  if (!property) return null
  const [details, ownerRows, shareableListings] = await Promise.all([
    getPropertyDetails(property.id, property.type),
    getDatabase()
      .select({
        ownerId: schema.propertyOwners.ownerId,
        ownershipSharePercent: schema.propertyOwners.ownershipSharePercent,
      })
      .from(schema.propertyOwners)
      .where(eq(schema.propertyOwners.propertyId, property.id)),
    getDatabase()
      .select({
        id: schema.listings.id,
        title: schema.properties.title,
        listingType: schema.listings.type,
      })
      .from(schema.listings)
      .innerJoin(
        schema.properties,
        eq(schema.listings.propertyId, schema.properties.id)
      )
      .where(
        and(
          eq(schema.listings.propertyId, property.id),
          eq(schema.listings.status, "active"),
          isNull(schema.properties.archivedAt),
          or(
            isNull(schema.listings.expiresAt),
            gt(schema.listings.expiresAt, new Date())
          )
        )
      ),
  ])
  return { property, details, ownerRows, shareableListings }
}

export async function getPropertyOwnerOptions() {
  const actor = await getActor()
  await assertPermission(actor.id, "owners.read")
  return listOwners({ pageSize: 100 })
}

export async function getPropertyOptions() {
  const actor = await getActor()
  await assertPermission(actor.id, "properties.read")
  return listProperties({ pageSize: 100 })
}

export async function getPropertiesTableData() {
  const actor = await getActor()
  await assertPermission(actor.id, "properties.read")
  return listProperties({ pageSize: 100 })
}

export async function getListingsTableData() {
  const actor = await getActor()
  await assertPermission(actor.id, "listings.read")
  return listListings({ pageSize: 100 })
}

export async function createListingShareLink(id: string) {
  const actor = await getActor()
  await assertPermission(actor.id, "listings.read")
  const parsedId = idSchema.parse(id)
  const listing = await getPublicListingById(parsedId)
  if (!listing) {
    throw new Error("This listing is not available for public sharing.")
  }

  const defaultExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const expiresAt =
    listing.expiresAt && listing.expiresAt < defaultExpiration
      ? listing.expiresAt
      : defaultExpiration
  const shortLink = await createShortLink({
    resourceType: "listing",
    resourceId: listing.id,
    createdById: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    expiresAt,
  })

  return { token: shortLink.token, expiresAt: shortLink.expiresAt }
}

export async function getOwnersTableData() {
  const actor = await getActor()
  await assertPermission(actor.id, "owners.read")
  return listOwners({ pageSize: 100 })
}

export async function savePropertyAction(
  _previousState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const actor = await getActor()
  const id = readText(formData, "id")
  const type = propertyTypeSchema.safeParse(readText(formData, "type"))
  const title = z
    .string()
    .trim()
    .min(2)
    .max(200)
    .safeParse(readText(formData, "title"))
  const latitude = readOptionalNumber(formData, "latitude")
  const longitude = readOptionalNumber(formData, "longitude")
  const parsedValues = z
    .object({
      lotAreaM2: z.number().nonnegative().nullable(),
      buildingAreaM2: z.number().nonnegative().nullable(),
      frontageM: z.number().nonnegative().nullable(),
      depthM: z.number().nonnegative().nullable(),
      latitude: z.number().min(-90).max(90).nullable(),
      longitude: z.number().min(-180).max(180).nullable(),
    })
    .safeParse({
      lotAreaM2: readOptionalNumber(formData, "lotAreaM2"),
      buildingAreaM2: readOptionalNumber(formData, "buildingAreaM2"),
      frontageM: readOptionalNumber(formData, "frontageM"),
      depthM: readOptionalNumber(formData, "depthM"),
      latitude,
      longitude,
    })

  if (!type.success) return { error: "نوع العقار غير صالح." }
  if (!title.success) return { error: "يرجى إدخال عنوان صحيح للعقار." }
  if (!parsedValues.success)
    return { error: "تحقق من قيم المساحات والإحداثيات." }

  const permission = id ? "properties.update" : "properties.create"
  await assertPermission(actor.id, permission)
  const ownerIds = z
    .array(idSchema)
    .safeParse(
      formData
        .getAll("ownerIds")
        .filter((value): value is string => typeof value === "string")
    )
  if (!ownerIds.success) return { error: "قائمة الملاك غير صالحة." }
  if (ownerIds.data.length > 0) {
    await assertPermission(actor.id, "owners.read")
  }

  const propertyValues = {
    type: type.data,
    title: title.data,
    description: nullableText(readText(formData, "description")),
    city: nullableText(readText(formData, "city")),
    district: nullableText(readText(formData, "district")),
    neighborhood: nullableText(readText(formData, "neighborhood")),
    address: nullableText(readText(formData, "address")),
    primaryStreet: nullableText(readText(formData, "primaryStreet")),
    secondaryStreet: nullableText(readText(formData, "secondaryStreet")),
    lotAreaM2:
      parsedValues.data.lotAreaM2 === null
        ? null
        : String(parsedValues.data.lotAreaM2),
    buildingAreaM2:
      parsedValues.data.buildingAreaM2 === null
        ? null
        : String(parsedValues.data.buildingAreaM2),
    frontageM:
      parsedValues.data.frontageM === null
        ? null
        : String(parsedValues.data.frontageM),
    depthM:
      parsedValues.data.depthM === null
        ? null
        : String(parsedValues.data.depthM),
    latitude:
      parsedValues.data.latitude === null
        ? null
        : String(parsedValues.data.latitude),
    longitude:
      parsedValues.data.longitude === null
        ? null
        : String(parsedValues.data.longitude),
  }

  const db = getDatabase()
  const saved = await db.transaction(async (transaction) => {
    const current = id ? await getPropertyById(id, transaction) : undefined
    if (id && !current) throw new Error("العقار المطلوب غير موجود.")
    if (current && current.type !== type.data) {
      return { error: "لا يمكن تغيير نوع العقار بعد إنشائه." }
    }

    const property = current
      ? await updateProperty(id, propertyValues, actor, transaction)
      : await createProperty(
          { ...propertyValues, createdById: actor.id },
          actor,
          transaction
        )
    if (!property) throw new Error("تعذر حفظ العقار.")

    await saveDetails(formData, property.id, type.data, actor, transaction)
    await setPropertyOwners(
      property.id,
      [...new Set(ownerIds.data)].map((ownerId) => ({ ownerId })),
      actor,
      transaction
    )

    return { id: property.id, saved: true }
  })

  return saved
}

async function saveDetails(
  formData: FormData,
  propertyId: string,
  type: z.infer<typeof propertyTypeSchema>,
  actor: Awaited<ReturnType<typeof getActor>>,
  transaction: DatabaseTransaction
) {
  const optionalInteger = (key: string) => {
    const value = readText(formData, key)
    if (!value) return undefined
    const number = Number(value)
    if (!Number.isSafeInteger(number) || number < 0) {
      throw new TypeError(`Invalid ${key} value.`)
    }
    return number
  }
  const optionalText = (key: string) => readText(formData, key) || undefined
  const optionalBoolean = (key: string) => {
    const value = readText(formData, key)
    if (!value) return null
    if (value !== "true" && value !== "false") {
      throw new TypeError(`Invalid ${key} value.`)
    }
    return value === "true"
  }
  const finish = () => {
    const value = optionalText("finish")
    if (!value) return null
    return z
      .enum(["unfinished", "basic", "good", "excellent", "luxury", "other"])
      .parse(value)
  }
  const tenant = () => {
    const value = optionalText("preferredTenant")
    if (!value) return null
    return z.enum(["family", "office", "bachelors", "other"]).parse(value)
  }

  const input: PropertyDetailsInput = (() => {
    switch (type) {
      case "building":
        return {
          type,
          propertyId,
          values: {
            currentFloors: optionalInteger("currentFloors"),
            constructionDesign: optionalText("constructionDesign"),
            deedIssuer: optionalText("deedIssuer"),
          },
        }
      case "land":
        return {
          type,
          propertyId,
          values: { deedIssuer: optionalText("deedIssuer") },
        }
      case "house_villa":
        return {
          type,
          propertyId,
          values: {
            currentFloors: optionalInteger("currentFloors"),
            apartmentCount: optionalInteger("apartmentCount"),
            constructionDesign: optionalText("constructionDesign"),
            finish: finish(),
            hasYard: optionalBoolean("hasYard"),
            hasReception: optionalBoolean("hasReception"),
            isFurnished: optionalBoolean("isFurnished"),
            hasBasement: optionalBoolean("hasBasement"),
            hasGuardRoom: optionalBoolean("hasGuardRoom"),
            deedIssuer: optionalText("deedIssuer"),
          },
        }
      case "investment":
        return {
          type,
          propertyId,
          values: {
            investmentType: optionalText("investmentType"),
            additionalDetails: optionalText("additionalDetails"),
            finish: finish(),
            deedIssuer: optionalText("deedIssuer"),
          },
        }
      case "commercial":
        return {
          type,
          propertyId,
          values: {
            previousActivity: optionalText("previousActivity"),
            openingCount: optionalInteger("openingCount"),
            toiletCount: optionalInteger("toiletCount"),
            hasStorage: optionalBoolean("hasStorage"),
            storageDetails: optionalText("storageDetails"),
            additionalDetails: optionalText("additionalDetails"),
          },
        }
      case "warehouse":
        return {
          type,
          propertyId,
          values: {
            openingCount: optionalInteger("openingCount"),
            toiletCount: optionalInteger("toiletCount"),
            additionalDetails: optionalText("additionalDetails"),
          },
        }
      case "yard":
        return {
          type,
          propertyId,
          values: {
            requestedActivity: optionalText("requestedActivity"),
            hasFence: optionalBoolean("hasFence"),
            hasRoof: optionalBoolean("hasRoof"),
            toiletCount: optionalInteger("toiletCount"),
            hasGuardRoom: optionalBoolean("hasGuardRoom"),
            additionalDetails: optionalText("additionalDetails"),
          },
        }
      case "apartment":
        return {
          type,
          propertyId,
          values: {
            roomCount: optionalInteger("roomCount"),
            toiletCount: optionalInteger("toiletCount"),
            kitchenDetails: optionalText("kitchenDetails"),
            hasSeparateMajlis: optionalBoolean("hasSeparateMajlis"),
            entranceCount: optionalInteger("entranceCount"),
            floorNumber: optionalText("floorNumber"),
            hasYard: optionalBoolean("hasYard"),
            isFurnished: optionalBoolean("isFurnished"),
            buildingType: optionalText("buildingType"),
            preferredTenant: tenant(),
            additionalDetails: optionalText("additionalDetails"),
          },
        }
    }
  })()

  await savePropertyDetails(input, actor, transaction)
}

export async function getListingFormData(id: string) {
  const actor = await getActor()
  await assertPermission(actor.id, "listings.read")
  const parsedId = idSchema.parse(id)
  return getListingById(parsedId)
}

export async function saveListingAction(
  _previousState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const actor = await getActor()
  const id = readText(formData, "id")
  const propertyId = idSchema.safeParse(readText(formData, "propertyId"))
  const type = z.enum(["sale", "rent"]).safeParse(readText(formData, "type"))
  const status = z
    .enum([
      "draft",
      "active",
      "reserved",
      "sold",
      "rented",
      "expired",
      "withdrawn",
    ])
    .safeParse(readText(formData, "status"))
  const price = z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/)
    .safeParse(readText(formData, "price"))
  const currencyCode = z
    .string()
    .regex(/^[A-Z]{3}$/)
    .safeParse(readText(formData, "currencyCode"))

  if (!propertyId.success) return { error: "اختر عقارًا صحيحًا." }
  if (!type.success || !status.success)
    return { error: "نوع الإعلان أو حالته غير صحيحة." }
  if (!price.success) return { error: "أدخل سعرًا صحيحًا." }
  if (!currencyCode.success)
    return { error: "رمز العملة يجب أن يتكون من ثلاثة أحرف." }
  const handledByOffice = z
    .enum(["true", "false"])
    .safeParse(readText(formData, "handledByOffice"))
  if (!handledByOffice.success) {
    return { error: "حدد ما إذا كان المكتب يتولى الإعلان." }
  }
  await assertPermission(actor.id, id ? "listings.update" : "listings.create")

  const source = z
    .enum(["office", "owner_direct", "external_broker", "referral", "other"])
    .safeParse(readText(formData, "source") || "office")
  if (!source.success) return { error: "مصدر الإعلان غير صالح." }
  if (
    (type.data === "sale" && status.data === "rented") ||
    (type.data === "rent" && status.data === "sold")
  ) {
    return { error: "حالة الإعلان لا تتوافق مع نوعه." }
  }

  const values = {
    status: status.data,
    salePrice: type.data === "sale" ? price.data : null,
    monthlyRent: type.data === "rent" ? price.data : null,
    keyMoney:
      type.data === "rent"
        ? nullableText(readText(formData, "keyMoney"))
        : null,
    advanceAmount:
      type.data === "rent"
        ? nullableText(readText(formData, "advanceAmount"))
        : null,
    expectedMonthlyIncome: nullableText(
      readText(formData, "expectedMonthlyIncome")
    ),
    currencyCode: currencyCode.data,
    leaseDurationMonths:
      Number(readText(formData, "leaseDurationMonths")) || null,
    source: source.data,
    sourceContactName: nullableText(readText(formData, "sourceContactName")),
    sourceContactPhone: nullableText(readText(formData, "sourceContactPhone")),
    handledByOffice: handledByOffice.data === "true",
    publicNotes: nullableText(readText(formData, "publicNotes")),
    internalNotes: nullableText(readText(formData, "internalNotes")),
    assignedToId: nullableText(readText(formData, "assignedToId")),
  }

  const db = getDatabase()
  const listing = await db.transaction(async (transaction) => {
    const result = id
      ? await updateListing(id, values, actor, transaction)
      : await createListing(
          {
            ...values,
            propertyId: propertyId.data,
            type: type.data,
            createdById: actor.id,
          },
          actor,
          transaction
        )
    if (!result) throw new Error("تعذر حفظ الإعلان.")
    return result
  })
  return { id: listing.id, saved: true }
}

export async function getOwnerFormData(id: string) {
  const actor = await getActor()
  await assertPermission(actor.id, "owners.read")
  const parsedId = idSchema.parse(id)
  const owner = await getOwnerById(parsedId)
  if (!owner) return null
  const { getDatabase, schema } = await import("@aqardesk/database")
  const database = getDatabase()
  const { eq } = await import("drizzle-orm")
  const phones = await database
    .select()
    .from(schema.ownerPhones)
    .where(eq(schema.ownerPhones.ownerId, parsedId))
  return { owner, phones }
}

export async function saveOwnerAction(
  _previousState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const actor = await getActor()
  const id = readText(formData, "id")
  const name = z
    .string()
    .trim()
    .min(2)
    .max(200)
    .safeParse(readText(formData, "name"))
  if (!name.success) return { error: "يرجى إدخال اسم مالك صحيح." }
  await assertPermission(actor.id, id ? "owners.update" : "owners.create")

  const phones = readText(formData, "phones")
    .split(/\r?\n/)
    .map((phoneNumber) => phoneNumber.trim())
    .filter(Boolean)
  if (phones.some((phone) => phone.length > 40)) {
    return { error: "رقم الهاتف طويل جدًا." }
  }

  const database = getDatabase()
  const owner = await database.transaction(async (transaction) => {
    const result = id
      ? await updateOwner(
          id,
          { name: name.data, notes: nullableText(readText(formData, "notes")) },
          actor,
          transaction
        )
      : await createOwner(
          {
            name: name.data,
            notes: nullableText(readText(formData, "notes")),
            createdById: actor.id,
          },
          actor,
          transaction
        )
    if (!result) throw new Error("تعذر حفظ بيانات المالك.")
    await setOwnerPhones(
      result.id,
      phones.map((phoneNumber) => ({ phoneNumber })),
      actor,
      transaction
    )
    return result
  })

  return { id: owner.id, saved: true }
}

export async function getListingMedia(listingId: string) {
  const actor = await getActor()
  await assertPermission(actor.id, "listings.read")
  return listListingMedia(idSchema.parse(listingId))
}

export async function deleteListingMediaAction(mediaId: string) {
  const actor = await getActor()
  await assertPermission(actor.id, "listings.update")
  return deleteListingMedia(idSchema.parse(mediaId), actor)
}

export async function getListingMediaUploadUrl(input: {
  listingId: string
  type: "photo" | "floor_plan" | "video" | "document"
  contentType: string
  sizeBytes: number
}) {
  const actor = await getActor()
  await assertPermission(actor.id, "listings.update")
  const listingId = idSchema.parse(input.listingId)
  const contentType = z
    .enum([
      "image/avif",
      "image/heic",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "video/mp4",
      "video/quicktime",
    ])
    .parse(input.contentType)
  const type = z
    .enum(["photo", "floor_plan", "video", "document"])
    .parse(input.type)
  const sizeBytes = z
    .number()
    .int()
    .positive()
    .max(250 * 1024 * 1024)
    .parse(input.sizeBytes)
  const storageType = type.replace("_", "-") as
    | "photo"
    | "floor-plan"
    | "video"
    | "document"
  if (
    (type === "photo" && !contentType.startsWith("image/")) ||
    (type === "floor_plan" &&
      !contentType.startsWith("image/") &&
      contentType !== "application/pdf") ||
    (type === "video" && !contentType.startsWith("video/")) ||
    (type === "document" && contentType !== "application/pdf")
  ) {
    throw new TypeError("نوع الملف لا يتوافق مع تصنيف الوسائط.")
  }
  const objectKey = createListingMediaObjectKey(listingId, storageType)
  return createUploadUrl({ objectKey, contentType, sizeBytes })
}

export async function saveListingMediaAction(
  _previousState: FormActionState = emptyState,
  formData: FormData
): Promise<FormActionState> {
  const actor = await getActor()
  await assertPermission(actor.id, "listings.update")
  const listingId = idSchema.safeParse(readText(formData, "listingId"))
  const type = z
    .enum(["photo", "floor_plan", "video", "document"])
    .safeParse(readText(formData, "type"))
  const objectKey = z.string().min(1).safeParse(readText(formData, "objectKey"))
  const contentType = z
    .string()
    .min(1)
    .safeParse(readText(formData, "contentType"))
  const sizeBytes = z.coerce
    .number()
    .int()
    .positive()
    .safeParse(readText(formData, "sizeBytes"))
  if (
    !listingId.success ||
    !type.success ||
    !objectKey.success ||
    !contentType.success ||
    !sizeBytes.success
  ) {
    return { error: "بيانات الملف غير مكتملة." }
  }
  if (!objectKey.data.startsWith(`listings/${listingId.data}/`)) {
    return { error: "مسار الملف غير صالح." }
  }

  const verified = await verifyUploadedObject({
    objectKey: objectKey.data,
    expectedContentType: z
      .enum([
        "image/avif",
        "image/heic",
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
        "video/mp4",
        "video/quicktime",
      ])
      .parse(contentType.data),
    expectedSizeBytes: sizeBytes.data,
  })

  const media = await createListingMedia(
    {
      listingId: listingId.data,
      type: type.data,
      storageProvider,
      objectKey: objectKey.data,
      originalFilename: nullableText(readText(formData, "originalFilename")),
      contentType: verified.contentType,
      sizeBytes: verified.sizeBytes,
      altText: nullableText(readText(formData, "altText")),
      uploadedById: actor.id,
    },
    actor
  )

  return { id: media?.id, saved: true }
}
