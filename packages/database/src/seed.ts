import {
  closeStorageClient,
  storageProvider,
  uploadStorageObject,
} from "@aqardesk/storage/server"
import { sql } from "drizzle-orm"
import { closeDatabase, getDatabase } from "./index"
import * as schema from "./schema"
import { permissions, rolePermissions, roles } from "./schema"

const testOwnerId = "00000000-0000-4000-8000-000000000001"

const testProperties = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    type: "building",
    title: "عمارة سكنية حديثة في حدة",
    description: "عمارة سكنية واسعة في حي هادئ ومخدوم في صنعاء.",
    countryCode: "YE",
    city: "صنعاء",
    district: "حدة",
    neighborhood: "حدة",
    primaryStreet: "شارع حدة",
    secondaryStreet: "جوار جولة المصباحي",
    lotAreaM2: "600",
    frontageM: "20",
    depthM: "30",
    buildingAreaM2: "1450",
    latitude: "15.305000",
    longitude: "44.191000",
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    type: "land",
    title: "أرض سكنية في بيت بوس",
    description: "أرض مناسبة للبناء في منطقة بيت بوس جنوب صنعاء.",
    countryCode: "YE",
    city: "صنعاء",
    district: "بيت بوس",
    neighborhood: "بيت بوس",
    primaryStreet: "شارع بيت بوس الرئيسي",
    secondaryStreet: "قرب جولة بيت بوس",
    lotAreaM2: "750",
    frontageM: "25",
    depthM: "30",
    latitude: "15.286000",
    longitude: "44.201000",
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    type: "house_villa",
    title: "فيلا عائلية في المنصورة",
    description: "فيلا عائلية بتصميم عملي وحوش واسع في مدينة عدن.",
    countryCode: "YE",
    city: "عدن",
    district: "المنصورة",
    neighborhood: "المنصورة",
    primaryStreet: "شارع التسعين",
    lotAreaM2: "420",
    frontageM: "14",
    depthM: "30",
    buildingAreaM2: "510",
    latitude: "12.879000",
    longitude: "44.998000",
  },
  {
    id: "00000000-0000-4000-8000-000000000104",
    type: "investment",
    title: "مبنى استثماري في شارع جمال",
    description: "مبنى متعدد الاستخدامات في موقع حيوي وسط مدينة تعز.",
    countryCode: "YE",
    city: "تعز",
    district: "القاهرة",
    neighborhood: "شارع جمال",
    primaryStreet: "شارع جمال",
    lotAreaM2: "900",
    buildingAreaM2: "2200",
    latitude: "13.579000",
    longitude: "44.020000",
  },
  {
    id: "00000000-0000-4000-8000-000000000105",
    type: "commercial",
    title: "محل تجاري في شارع تعز",
    description: "محل مناسب للأنشطة التجارية في منطقة حيوية بمدينة إب.",
    countryCode: "YE",
    city: "إب",
    district: "الظهار",
    neighborhood: "شارع تعز",
    primaryStreet: "شارع تعز",
    lotAreaM2: "120",
    latitude: "13.966000",
    longitude: "44.183000",
  },
  {
    id: "00000000-0000-4000-8000-000000000106",
    type: "warehouse",
    title: "مستودع للإيجار في المنطقة الصناعية",
    description: "مستودع واسع بمدخل مناسب للتحميل في مدينة الحديدة.",
    countryCode: "YE",
    city: "الحديدة",
    district: "المنطقة الصناعية",
    neighborhood: "المنطقة الصناعية",
    primaryStreet: "شارع الميناء",
    lotAreaM2: "1000",
    buildingAreaM2: "800",
    latitude: "14.797000",
    longitude: "42.954000",
  },
  {
    id: "00000000-0000-4000-8000-000000000107",
    type: "yard",
    title: "أرض مسورة في فوة",
    description: "أرض مسورة مناسبة للتخزين أو الاستخدام التجاري في المكلا.",
    countryCode: "YE",
    city: "المكلا",
    district: "فوة",
    neighborhood: "فوة",
    primaryStreet: "شارع فوة الرئيسي",
    lotAreaM2: "1500",
    latitude: "14.558000",
    longitude: "49.130000",
  },
  {
    id: "00000000-0000-4000-8000-000000000108",
    type: "apartment",
    title: "شقة عائلية في السحيل",
    description: "شقة عائلية في حي السحيل بمدينة سيئون.",
    countryCode: "YE",
    city: "سيئون",
    district: "السحيل",
    neighborhood: "السحيل",
    primaryStreet: "شارع السحيل",
    lotAreaM2: "160",
    latitude: "15.957000",
    longitude: "48.787000",
  },
] as const

const testListings = [
  {
    id: "00000000-0000-4000-8000-000000000201",
    propertyId: testProperties[0].id,
    type: "sale",
    salePrice: "85000000",
    expectedMonthlyIncome: "650000",
  },
  {
    id: "00000000-0000-4000-8000-000000000202",
    propertyId: testProperties[1].id,
    type: "sale",
    salePrice: "18000000",
  },
  {
    id: "00000000-0000-4000-8000-000000000203",
    propertyId: testProperties[2].id,
    type: "sale",
    salePrice: "42000000",
  },
  {
    id: "00000000-0000-4000-8000-000000000204",
    propertyId: testProperties[3].id,
    type: "rent",
    monthlyRent: "350000",
    keyMoney: "0",
    advanceAmount: "350000",
    leaseDurationMonths: 12,
  },
  {
    id: "00000000-0000-4000-8000-000000000205",
    propertyId: testProperties[4].id,
    type: "rent",
    monthlyRent: "85000",
    keyMoney: "250000",
    advanceAmount: "85000",
    leaseDurationMonths: 12,
  },
  {
    id: "00000000-0000-4000-8000-000000000206",
    propertyId: testProperties[5].id,
    type: "rent",
    monthlyRent: "180000",
    keyMoney: "0",
    advanceAmount: "180000",
    leaseDurationMonths: 12,
  },
  {
    id: "00000000-0000-4000-8000-000000000207",
    propertyId: testProperties[6].id,
    type: "rent",
    monthlyRent: "70000",
    keyMoney: "0",
    advanceAmount: "70000",
    leaseDurationMonths: 12,
  },
  {
    id: "00000000-0000-4000-8000-000000000208",
    propertyId: testProperties[7].id,
    type: "rent",
    monthlyRent: "45000",
    keyMoney: "0",
    advanceAmount: "45000",
    leaseDurationMonths: 12,
  },
] as const

const testListingPhotos = [
  {
    listingId: testListings[0].id,
    photos: [
      "photo-1486406146926-c627a92ad1ab",
      "photo-1600607687920-4e2a09cf159d",
      "photo-1600566753086-00f18fb6b3ea",
    ],
    altText: "صور عمارة سكنية حديثة",
  },
  {
    listingId: testListings[1].id,
    photos: [
      "photo-1509316785289-025f5b846b35",
      "photo-1500382017468-9049fed747ef",
      "photo-1500530855697-b586d89ba3ee",
    ],
    altText: "صور أرض سكنية",
  },
  {
    listingId: testListings[2].id,
    photos: [
      "photo-1600585154340-be6161a56a0c",
      "photo-1600585154526-990dced4db0d",
      "photo-1600047509807-ba8f99d2cdde",
    ],
    altText: "صور فيلا عصرية",
  },
  {
    listingId: testListings[3].id,
    photos: [
      "photo-1600607687939-ce8a6c25118c",
      "photo-1600607687920-4e2a09cf159d",
      "photo-1600566753190-17f0baa2a6c3",
    ],
    altText: "صور مبنى استثماري",
  },
  {
    listingId: testListings[4].id,
    photos: [
      "photo-1517248135467-4c7edcad34c4",
      "photo-1555529669-e69e7aa0ba9a",
      "photo-1497366754035-f200968a6e72",
    ],
    altText: "صور محل تجاري",
  },
  {
    listingId: testListings[5].id,
    photos: [
      "photo-1586528116311-ad8dd3c8310d",
      "photo-1586864387967-d02ef85d93e8",
      "photo-1565610222536-ef125c59da2e",
    ],
    altText: "صور مستودع واسع",
  },
  {
    listingId: testListings[6].id,
    photos: [
      "photo-1504307651254-35680f356dfd",
      "photo-1511818966892-d7d671e672a2",
      "photo-1500534623283-312aade485b7",
    ],
    altText: "صور أرض مسورة",
  },
  {
    listingId: testListings[7].id,
    photos: [
      "photo-1600210492486-724fe5c67fb0",
      "photo-1600607687939-ce8a6c25118c",
      "photo-1600566753086-00f18fb6b3ea",
    ],
    altText: "صور شقة عصرية",
  },
] as const

const maximumSeedPhotoBytes = 10 * 1024 * 1024

async function seedListingPhotos() {
  const media: (typeof schema.listingMedia.$inferInsert)[] = []

  for (const photo of testListingPhotos) {
    for (const [index, photoId] of photo.photos.entries()) {
      const url = new URL(
        `${photoId}?auto=format&fit=crop&w=1600&q=82`,
        "https://images.unsplash.com/"
      )
      const response = await fetch(url, {
        headers: { Accept: "image/jpeg" },
        signal: AbortSignal.timeout(15_000),
      })

      if (!response.ok) {
        throw new Error(
          `Unable to download seed photo ${photoId}: HTTP ${response.status}.`
        )
      }

      const contentType = response.headers
        .get("content-type")
        ?.split(";")[0]
        ?.trim()
        .toLowerCase()
      if (contentType !== "image/jpeg") {
        throw new Error(
          `Seed photo ${photoId} returned an unsupported content type.`
        )
      }

      const contentLength = Number(response.headers.get("content-length"))
      if (contentLength > maximumSeedPhotoBytes) {
        throw new Error(`Seed photo ${photoId} exceeds the 10 MiB limit.`)
      }

      const body = new Uint8Array(await response.arrayBuffer())
      if (body.byteLength === 0 || body.byteLength > maximumSeedPhotoBytes) {
        throw new Error(
          `Seed photo ${photoId} has an invalid size or exceeds the 10 MiB limit.`
        )
      }

      const objectKey =
        index === 0
          ? `listings/${photo.listingId}/photo/seed-cover-v1.jpg`
          : `listings/${photo.listingId}/photo/seed-gallery-v1-${index}.jpg`
      await uploadStorageObject({
        objectKey,
        contentType: "image/jpeg",
        body,
      })

      media.push({
        listingId: photo.listingId,
        type: "photo",
        storageProvider,
        objectKey,
        originalFilename: `unsplash-${photoId}.jpg`,
        contentType: "image/jpeg",
        sizeBytes: body.byteLength,
        altText: photo.altText,
        position: index,
        isPrimary: index === 0,
      })
    }
  }

  return media
}

const permissionDefinitions = [
  ["properties.read", "View properties"],
  ["properties.create", "Create properties"],
  ["properties.update", "Update properties"],
  ["properties.archive", "Archive properties"],
  ["properties.delete", "Permanently delete properties"],
  ["listings.read", "View listings"],
  ["listings.create", "Create listings"],
  ["listings.update", "Update listings"],
  ["listings.delete", "Permanently delete listings"],
  ["listings.publish", "Publish listings"],
  ["listings.close", "Close listings"],
  ["listings.share", "Share listing links"],
  ["owners.read", "View owner records"],
  ["owners.create", "Create owner records"],
  ["owners.update", "Update owner records"],
  ["owners.delete", "Permanently delete owner records"],
  ["media.manage", "Manage listing media"],
  ["favorites.manage", "Manage favorites"],
  ["users.manage", "Manage user accounts"],
  ["roles.manage", "Manage roles and permissions"],
  ["audit.read", "View change history"],
  ["teams.read", "View office teams"],
  ["teams.manage", "Create teams and assign members"],
  ["office_settings.read", "View office settings"],
  ["office_settings.manage", "Manage office settings"],
] as const

const allPermissions = permissionDefinitions.map(([key]) => key)
const readPermissions = [
  "properties.read",
  "listings.read",
  "owners.read",
  "teams.read",
  "office_settings.read",
] as const

const roleDefinitions = [
  {
    key: "customer",
    name: "Customer",
    description: "Customer account with no office permissions.",
    permissionKeys: [],
  },
  {
    key: "admin",
    name: "Administrator",
    description: "Full access to office data and access control.",
    permissionKeys: allPermissions,
  },
  {
    key: "manager",
    name: "Manager",
    description: "Manage listings, properties, and owner records.",
    permissionKeys: permissionDefinitions
      .map(([key]) => key)
      .filter(
        (key) =>
          key !== "users.manage" &&
          key !== "roles.manage" &&
          key !== "office_settings.manage"
      ),
  },
  {
    key: "staff",
    name: "Staff",
    description: "Create and maintain property listings.",
    permissionKeys: [
      ...readPermissions,
      "properties.create",
      "properties.update",
      "listings.create",
      "listings.update",
      "listings.publish",
      "listings.share",
      "owners.create",
      "owners.update",
      "media.manage",
      "favorites.manage",
    ],
  },
  {
    key: "viewer",
    name: "Read only",
    description: "View property, listing, and owner records.",
    permissionKeys: readPermissions,
  },
] as const

async function seed() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Development seed data cannot be applied in production.")
  }

  const db = getDatabase()
  const testMedia = await seedListingPhotos()

  await db.transaction(async (tx) => {
    await tx
      .insert(roles)
      .values(
        roleDefinitions.map(({ key, name, description }) => ({
          id: key,
          key,
          name,
          description,
        }))
      )
      .onConflictDoNothing()

    await tx
      .insert(permissions)
      .values(
        permissionDefinitions.map(([key, description]) => ({
          id: key,
          key,
          description,
        }))
      )
      .onConflictDoNothing()

    await tx
      .insert(rolePermissions)
      .values(
        roleDefinitions.flatMap(({ key, permissionKeys }) =>
          permissionKeys.map((permissionId) => ({
            roleId: key,
            permissionId,
          }))
        )
      )
      .onConflictDoNothing()

    await tx
      .insert(schema.officeSettings)
      .values({
        id: "default",
        name: "عقار دِسك",
        countryCode: "YE",
        defaultCurrency: "YER",
        timezone: "Asia/Aden",
        city: "صنعاء",
      })
      .onConflictDoUpdate({
        target: schema.officeSettings.id,
        set: {
          countryCode: "YE",
          defaultCurrency: "YER",
          timezone: "Asia/Aden",
          city: "صنعاء",
        },
      })

    await tx
      .insert(schema.owners)
      .values({
        id: testOwnerId,
        name: "مالك تجريبي",
        notes: "مالك تجريبي لعقارات في اليمن.",
      })
      .onConflictDoUpdate({
        target: schema.owners.id,
        set: {
          name: "مالك تجريبي",
          notes: "مالك تجريبي لعقارات في اليمن.",
        },
      })

    await tx
      .insert(schema.ownerPhones)
      .values({
        ownerId: testOwnerId,
        phoneNumber: "+967777000001",
        label: "رقم يمني تجريبي",
      })
      .onConflictDoUpdate({
        target: [schema.ownerPhones.ownerId, schema.ownerPhones.phoneNumber],
        set: { label: "رقم يمني تجريبي" },
      })

    await tx
      .insert(schema.properties)
      .values(
        testProperties.map((property) => ({
          ...property,
          createdById: null,
        }))
      )
      .onConflictDoUpdate({
        target: schema.properties.id,
        set: {
          type: sql`excluded.type`,
          title: sql`excluded.title`,
          countryCode: sql`excluded.country_code`,
          description: sql`excluded.description`,
          city: sql`excluded.city`,
          district: sql`excluded.district`,
          neighborhood: sql`excluded.neighborhood`,
          primaryStreet: sql`excluded.primary_street`,
          secondaryStreet: sql`excluded.secondary_street`,
          lotAreaM2: sql`excluded.lot_area_m2`,
          frontageM: sql`excluded.frontage_m`,
          depthM: sql`excluded.depth_m`,
          buildingAreaM2: sql`excluded.building_area_m2`,
          latitude: sql`excluded.latitude`,
          longitude: sql`excluded.longitude`,
          updatedAt: new Date(),
        },
      })

    await tx
      .insert(schema.propertyOwners)
      .values(
        testProperties.map((property) => ({
          propertyId: property.id,
          ownerId: testOwnerId,
          ownershipSharePercent: "100",
        }))
      )
      .onConflictDoNothing()

    await tx
      .insert(schema.buildingDetails)
      .values({
        propertyId: testProperties[0].id,
        currentFloors: 4,
        constructionDesign: "تصميم حديث",
        deedIssuer: "الهيئة العامة للأراضي والمساحة والتخطيط العمراني",
      })
      .onConflictDoUpdate({
        target: schema.buildingDetails.propertyId,
        set: {
          currentFloors: 4,
          constructionDesign: "تصميم حديث",
          deedIssuer: "الهيئة العامة للأراضي والمساحة والتخطيط العمراني",
        },
      })

    await tx
      .insert(schema.landDetails)
      .values({
        propertyId: testProperties[1].id,
        deedIssuer: "الهيئة العامة للأراضي والمساحة والتخطيط العمراني",
      })
      .onConflictDoUpdate({
        target: schema.landDetails.propertyId,
        set: {
          deedIssuer: "الهيئة العامة للأراضي والمساحة والتخطيط العمراني",
        },
      })

    await tx
      .insert(schema.houseVillaDetails)
      .values({
        propertyId: testProperties[2].id,
        currentFloors: 2,
        constructionDesign: "تصميم حديث",
        finish: "excellent",
        hasYard: true,
        hasReception: true,
        deedIssuer: "الهيئة العامة للأراضي والمساحة والتخطيط العمراني",
      })
      .onConflictDoUpdate({
        target: schema.houseVillaDetails.propertyId,
        set: {
          currentFloors: 2,
          constructionDesign: "تصميم حديث",
          finish: "excellent",
          hasYard: true,
          hasReception: true,
          deedIssuer: "الهيئة العامة للأراضي والمساحة والتخطيط العمراني",
        },
      })

    await tx
      .insert(schema.investmentDetails)
      .values({
        propertyId: testProperties[3].id,
        investmentType: "commercial_building",
        additionalDetails: "مبنى استثماري تجريبي.",
        finish: "good",
      })
      .onConflictDoUpdate({
        target: schema.investmentDetails.propertyId,
        set: {
          investmentType: "commercial_building",
          additionalDetails: "مبنى استثماري تجريبي.",
          finish: "good",
        },
      })

    await tx
      .insert(schema.commercialDetails)
      .values({
        propertyId: testProperties[4].id,
        previousActivity: "مطعم",
        openingCount: 2,
        toiletCount: 1,
        hasStorage: true,
        storageDetails: "مخزن خلفي تجريبي.",
      })
      .onConflictDoUpdate({
        target: schema.commercialDetails.propertyId,
        set: {
          previousActivity: "مطعم",
          openingCount: 2,
          toiletCount: 1,
          hasStorage: true,
          storageDetails: "مخزن خلفي تجريبي.",
        },
      })

    await tx
      .insert(schema.warehouseDetails)
      .values({
        propertyId: testProperties[5].id,
        openingCount: 2,
        toiletCount: 2,
        additionalDetails: "بوابة تحميل تجريبية.",
      })
      .onConflictDoUpdate({
        target: schema.warehouseDetails.propertyId,
        set: {
          openingCount: 2,
          toiletCount: 2,
          additionalDetails: "بوابة تحميل تجريبية.",
        },
      })

    await tx
      .insert(schema.yardDetails)
      .values({
        propertyId: testProperties[6].id,
        requestedActivity: "تخزين",
        hasFence: true,
        hasRoof: false,
        toiletCount: 1,
        hasGuardRoom: true,
      })
      .onConflictDoUpdate({
        target: schema.yardDetails.propertyId,
        set: {
          requestedActivity: "تخزين",
          hasFence: true,
          hasRoof: false,
          toiletCount: 1,
          hasGuardRoom: true,
        },
      })

    await tx
      .insert(schema.apartmentDetails)
      .values({
        propertyId: testProperties[7].id,
        roomCount: 4,
        toiletCount: 3,
        kitchenDetails: "مطبخ مستقل",
        hasSeparateMajlis: true,
        entranceCount: 1,
        floorNumber: "الثاني",
        isFurnished: false,
        buildingType: "سكني",
        preferredTenant: "family",
      })
      .onConflictDoUpdate({
        target: schema.apartmentDetails.propertyId,
        set: {
          roomCount: 4,
          toiletCount: 3,
          kitchenDetails: "مطبخ مستقل",
          hasSeparateMajlis: true,
          entranceCount: 1,
          floorNumber: "الثاني",
          isFurnished: false,
          buildingType: "سكني",
          preferredTenant: "family",
        },
      })

    await tx
      .insert(schema.listings)
      .values(
        testListings.map((listing) => ({
          ...listing,
          status: "active" as const,
          currencyCode: "YER",
          source: "office" as const,
          publishedAt: new Date("2026-01-01T00:00:00.000Z"),
        }))
      )
      .onConflictDoUpdate({
        target: schema.listings.id,
        set: {
          propertyId: sql`excluded.property_id`,
          type: sql`excluded.type`,
          status: sql`excluded.status`,
          salePrice: sql`excluded.sale_price`,
          monthlyRent: sql`excluded.monthly_rent`,
          keyMoney: sql`excluded.key_money`,
          advanceAmount: sql`excluded.advance_amount`,
          expectedMonthlyIncome: sql`excluded.expected_monthly_income`,
          currencyCode: "YER",
          leaseDurationMonths: sql`excluded.lease_duration_months`,
          source: "office",
          publishedAt: sql`excluded.published_at`,
          updatedAt: new Date(),
        },
      })

    await tx
      .insert(schema.listingMedia)
      .values(testMedia)
      .onConflictDoUpdate({
        target: [
          schema.listingMedia.storageProvider,
          schema.listingMedia.objectKey,
        ],
        set: {
          listingId: sql`excluded.listing_id`,
          type: sql`excluded.type`,
          originalFilename: sql`excluded.original_filename`,
          contentType: sql`excluded.content_type`,
          sizeBytes: sql`excluded.size_bytes`,
          altText: sql`excluded.alt_text`,
          position: sql`excluded.position`,
          isPrimary: sql`excluded.is_primary`,
        },
      })
  })
}

try {
  await seed()
  const photoCount = testListingPhotos.reduce(
    (count, listing) => count + listing.photos.length,
    0
  )
  console.info(
    `Seeded default roles, permissions, ${testListings.length} test listings, and ${photoCount} listing photos.`
  )
} finally {
  try {
    await closeDatabase()
  } finally {
    closeStorageClient()
  }
}
