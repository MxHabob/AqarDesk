import { closeDatabase, getDatabase } from "./index"
import * as schema from "./schema"
import { permissions, rolePermissions, roles } from "./schema"

const testOwnerId = "00000000-0000-4000-8000-000000000001"

const testProperties = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    type: "building",
    title: "عمارة سكنية للاختبار - حي الياسمين",
    description: "عرض تجريبي لعمارة سكنية.",
    city: "الرياض",
    district: "الياسمين",
    neighborhood: "شمال الرياض",
    primaryStreet: "طريق أنس بن مالك",
    secondaryStreet: "شارع فرعي",
    lotAreaM2: "600",
    frontageM: "20",
    depthM: "30",
    buildingAreaM2: "1450",
    latitude: "24.850000",
    longitude: "46.650000",
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    type: "land",
    title: "أرض سكنية للاختبار - حي النرجس",
    description: "أرض تجريبية مناسبة للسكن.",
    city: "الرياض",
    district: "النرجس",
    neighborhood: "شمال الرياض",
    primaryStreet: "شارع عثمان بن عفان",
    secondaryStreet: "شارع 20",
    lotAreaM2: "750",
    frontageM: "25",
    depthM: "30",
    latitude: "24.900000",
    longitude: "46.630000",
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    type: "house_villa",
    title: "فيلا للاختبار - حي الملقا",
    description: "فيلا تجريبية مع حوش.",
    city: "الرياض",
    district: "الملقا",
    neighborhood: "شمال الرياض",
    primaryStreet: "شارع الخير",
    lotAreaM2: "420",
    frontageM: "14",
    depthM: "30",
    buildingAreaM2: "510",
    latitude: "24.820000",
    longitude: "46.610000",
  },
  {
    id: "00000000-0000-4000-8000-000000000104",
    type: "investment",
    title: "مبنى استثماري للاختبار - حي العليا",
    description: "عرض تجريبي لعقار استثماري.",
    city: "الرياض",
    district: "العليا",
    neighborhood: "وسط الرياض",
    primaryStreet: "طريق الملك فهد",
    lotAreaM2: "900",
    buildingAreaM2: "2200",
    latitude: "24.700000",
    longitude: "46.680000",
  },
  {
    id: "00000000-0000-4000-8000-000000000105",
    type: "commercial",
    title: "محل تجاري للاختبار - حي الروضة",
    description: "محل تجريبي على شارع تجاري.",
    city: "الرياض",
    district: "الروضة",
    neighborhood: "شرق الرياض",
    primaryStreet: "شارع خالد بن الوليد",
    lotAreaM2: "120",
    latitude: "24.750000",
    longitude: "46.750000",
  },
  {
    id: "00000000-0000-4000-8000-000000000106",
    type: "warehouse",
    title: "مستودع للاختبار - المدينة الصناعية",
    description: "مستودع تجريبي للإيجار.",
    city: "الرياض",
    district: "المدينة الصناعية",
    neighborhood: "جنوب الرياض",
    primaryStreet: "شارع المصانع",
    lotAreaM2: "1000",
    buildingAreaM2: "800",
    latitude: "24.580000",
    longitude: "46.820000",
  },
  {
    id: "00000000-0000-4000-8000-000000000107",
    type: "yard",
    title: "أرض مسورة للاختبار - حي السلي",
    description: "أرض تجريبية مسورة ومناسبة للتخزين.",
    city: "الرياض",
    district: "السلي",
    neighborhood: "شرق الرياض",
    primaryStreet: "شارع هارون الرشيد",
    lotAreaM2: "1500",
    latitude: "24.650000",
    longitude: "46.820000",
  },
  {
    id: "00000000-0000-4000-8000-000000000108",
    type: "apartment",
    title: "شقة للاختبار - حي قرطبة",
    description: "شقة تجريبية مناسبة للعائلة.",
    city: "الرياض",
    district: "قرطبة",
    neighborhood: "شرق الرياض",
    primaryStreet: "شارع سعيد بن زيد",
    lotAreaM2: "160",
    latitude: "24.810000",
    longitude: "46.730000",
  },
] as const

const testListings = [
  {
    id: "00000000-0000-4000-8000-000000000201",
    propertyId: testProperties[0].id,
    type: "sale",
    salePrice: "2800000",
    expectedMonthlyIncome: "24000",
  },
  {
    id: "00000000-0000-4000-8000-000000000202",
    propertyId: testProperties[1].id,
    type: "sale",
    salePrice: "1200000",
  },
  {
    id: "00000000-0000-4000-8000-000000000203",
    propertyId: testProperties[2].id,
    type: "sale",
    salePrice: "1950000",
  },
  {
    id: "00000000-0000-4000-8000-000000000204",
    propertyId: testProperties[3].id,
    type: "rent",
    monthlyRent: "45000",
    keyMoney: "0",
    advanceAmount: "45000",
    leaseDurationMonths: 12,
  },
  {
    id: "00000000-0000-4000-8000-000000000205",
    propertyId: testProperties[4].id,
    type: "rent",
    monthlyRent: "8500",
    keyMoney: "25000",
    advanceAmount: "8500",
    leaseDurationMonths: 12,
  },
  {
    id: "00000000-0000-4000-8000-000000000206",
    propertyId: testProperties[5].id,
    type: "rent",
    monthlyRent: "18000",
    keyMoney: "0",
    advanceAmount: "18000",
    leaseDurationMonths: 12,
  },
  {
    id: "00000000-0000-4000-8000-000000000207",
    propertyId: testProperties[6].id,
    type: "rent",
    monthlyRent: "7000",
    keyMoney: "0",
    advanceAmount: "7000",
    leaseDurationMonths: 12,
  },
  {
    id: "00000000-0000-4000-8000-000000000208",
    propertyId: testProperties[7].id,
    type: "rent",
    monthlyRent: "4200",
    keyMoney: "0",
    advanceAmount: "4200",
    leaseDurationMonths: 12,
  },
] as const

const permissionDefinitions = [
  ["properties.read", "View properties"],
  ["properties.create", "Create properties"],
  ["properties.update", "Update properties"],
  ["properties.archive", "Archive properties"],
  ["listings.read", "View listings"],
  ["listings.create", "Create listings"],
  ["listings.update", "Update listings"],
  ["listings.publish", "Publish listings"],
  ["listings.close", "Close listings"],
  ["listings.share", "Share listing links"],
  ["owners.read", "View owner records"],
  ["owners.create", "Create owner records"],
  ["owners.update", "Update owner records"],
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
      .values({ id: "default", name: "عقار دِسك" })
      .onConflictDoNothing()

    await tx
      .insert(schema.owners)
      .values({
        id: testOwnerId,
        name: "مالك تجريبي",
        notes: "سجل تجريبي أُنشئ بواسطة seed.",
      })
      .onConflictDoNothing()

    await tx
      .insert(schema.ownerPhones)
      .values({
        ownerId: testOwnerId,
        phoneNumber: "0500000000",
        label: "رقم تجريبي",
      })
      .onConflictDoNothing()

    await tx
      .insert(schema.properties)
      .values(
        testProperties.map((property) => ({
          ...property,
          createdById: null,
        }))
      )
      .onConflictDoNothing()

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
        deedIssuer: "كاتب بصيرة تجريبي",
      })
      .onConflictDoNothing()

    await tx
      .insert(schema.landDetails)
      .values({
        propertyId: testProperties[1].id,
        deedIssuer: "كاتب بصيرة تجريبي",
      })
      .onConflictDoNothing()

    await tx
      .insert(schema.houseVillaDetails)
      .values({
        propertyId: testProperties[2].id,
        currentFloors: 2,
        constructionDesign: "تصميم حديث",
        finish: "excellent",
        hasYard: true,
        hasReception: true,
        deedIssuer: "كاتب بصيرة تجريبي",
      })
      .onConflictDoNothing()

    await tx
      .insert(schema.investmentDetails)
      .values({
        propertyId: testProperties[3].id,
        investmentType: "commercial_building",
        additionalDetails: "مبنى استثماري تجريبي.",
        finish: "good",
      })
      .onConflictDoNothing()

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
      .onConflictDoNothing()

    await tx
      .insert(schema.warehouseDetails)
      .values({
        propertyId: testProperties[5].id,
        openingCount: 2,
        toiletCount: 2,
        additionalDetails: "بوابة تحميل تجريبية.",
      })
      .onConflictDoNothing()

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
      .onConflictDoNothing()

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
      .onConflictDoNothing()

    await tx
      .insert(schema.listings)
      .values(
        testListings.map((listing) => ({
          ...listing,
          status: "active" as const,
          currencyCode: "SAR",
          source: "office" as const,
          publishedAt: new Date("2026-01-01T00:00:00.000Z"),
        }))
      )
      .onConflictDoNothing()
  })
}

try {
  await seed()
  console.info(
    `Seeded default roles, permissions, and ${testListings.length} test listings.`
  )
} finally {
  await closeDatabase()
}
