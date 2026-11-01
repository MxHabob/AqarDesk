import { propertyTypeValues } from "@aqardesk/categories"
import { z } from "zod"

const optionalText = z.string().trim().max(2000).nullable().optional()

const optionalNumber = (min = 0, max = Number.MAX_SAFE_INTEGER) =>
  z.preprocess(
    (value) =>
      value === null
        ? null
        : value === "" || value === undefined
          ? undefined
          : value,
    z.coerce.number().finite().min(min).max(max).nullable().optional()
  )

const optionalCount = z.preprocess(
  (value) =>
    value === null
      ? null
      : value === "" || value === undefined
        ? undefined
        : value,
  z.coerce.number().int().min(0).nullable().optional()
)

const propertyFinish = [
  "unfinished",
  "basic",
  "good",
  "excellent",
  "luxury",
  "other",
] as const

const basePropertySchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: optionalText,
  city: optionalText,
  district: optionalText,
  neighborhood: optionalText,
  address: optionalText,
  primaryStreet: optionalText,
  secondaryStreet: optionalText,
  lotAreaM2: optionalNumber(),
  frontageM: optionalNumber(),
  depthM: optionalNumber(),
  buildingAreaM2: optionalNumber(),
  latitude: optionalNumber(-90, 90),
  longitude: optionalNumber(-180, 180),
})

const buildingDetailsSchema = z.object({
  currentFloors: optionalCount,
  constructionDesign: optionalText,
  deedIssuer: optionalText,
})

const landDetailsSchema = z.object({
  deedIssuer: optionalText,
})

const houseVillaDetailsSchema = z.object({
  currentFloors: optionalCount,
  apartmentCount: optionalCount,
  constructionDesign: optionalText,
  finish: z.enum(propertyFinish).nullable().optional(),
  hasYard: z.boolean().nullable().optional(),
  hasReception: z.boolean().nullable().optional(),
  isFurnished: z.boolean().nullable().optional(),
  hasBasement: z.boolean().nullable().optional(),
  hasGuardRoom: z.boolean().nullable().optional(),
  deedIssuer: optionalText,
})

const investmentDetailsSchema = z.object({
  investmentType: optionalText,
  additionalDetails: optionalText,
  finish: z.enum(propertyFinish).nullable().optional(),
  deedIssuer: optionalText,
})

const commercialDetailsSchema = z.object({
  previousActivity: optionalText,
  openingCount: optionalCount,
  toiletCount: optionalCount,
  hasStorage: z.boolean().nullable().optional(),
  storageDetails: optionalText,
  additionalDetails: optionalText,
})

const warehouseDetailsSchema = z.object({
  openingCount: optionalCount,
  toiletCount: optionalCount,
  additionalDetails: optionalText,
})

const yardDetailsSchema = z.object({
  requestedActivity: optionalText,
  hasFence: z.boolean().nullable().optional(),
  hasRoof: z.boolean().nullable().optional(),
  toiletCount: optionalCount,
  hasGuardRoom: z.boolean().nullable().optional(),
  additionalDetails: optionalText,
})

const apartmentDetailsSchema = z.object({
  roomCount: optionalCount,
  toiletCount: optionalCount,
  kitchenDetails: optionalText,
  hasSeparateMajlis: z.boolean().nullable().optional(),
  entranceCount: optionalCount,
  floorNumber: optionalText,
  hasYard: z.boolean().nullable().optional(),
  isFurnished: z.boolean().nullable().optional(),
  buildingType: optionalText,
  preferredTenant: z
    .enum(["family", "office", "bachelors", "other"])
    .nullable()
    .optional(),
  additionalDetails: optionalText,
})

export const createPropertySchema = z.discriminatedUnion("type", [
  basePropertySchema.extend({
    type: z.literal("building"),
    details: buildingDetailsSchema,
  }),
  basePropertySchema.extend({
    type: z.literal("land"),
    details: landDetailsSchema,
  }),
  basePropertySchema.extend({
    type: z.literal("house_villa"),
    details: houseVillaDetailsSchema,
  }),
  basePropertySchema.extend({
    type: z.literal("investment"),
    details: investmentDetailsSchema,
  }),
  basePropertySchema.extend({
    type: z.literal("commercial"),
    details: commercialDetailsSchema,
  }),
  basePropertySchema.extend({
    type: z.literal("warehouse"),
    details: warehouseDetailsSchema,
  }),
  basePropertySchema.extend({
    type: z.literal("yard"),
    details: yardDetailsSchema,
  }),
  basePropertySchema.extend({
    type: z.literal("apartment"),
    details: apartmentDetailsSchema,
  }),
])

export const createListingSchema = z
  .object({
    propertyId: z.uuid(),
    type: z.enum(["sale", "rent"]),
    status: z
      .enum([
        "draft",
        "active",
        "reserved",
        "sold",
        "rented",
        "expired",
        "withdrawn",
      ])
      .default("draft"),
    salePrice: optionalNumber(),
    monthlyRent: optionalNumber(),
    keyMoney: optionalNumber(),
    advanceAmount: optionalNumber(),
    expectedMonthlyIncome: optionalNumber(),
    currencyCode: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .default("SAR"),
    leaseDurationMonths: z.preprocess(
      (value) =>
        value === null
          ? null
          : value === "" || value === undefined
            ? undefined
            : value,
      z.coerce.number().int().positive().nullable().optional()
    ),
    source: z
      .enum(["office", "owner_direct", "external_broker", "referral", "other"])
      .default("office"),
    sourceContactName: optionalText,
    sourceContactPhone: optionalText,
    handledByOffice: z.boolean().default(true),
    publicNotes: optionalText,
    internalNotes: optionalText,
    assignedToId: z.string().min(1).nullable().optional(),
  })
  .superRefine((listing, context) => {
    if (listing.type === "sale") {
      for (const field of [
        "monthlyRent",
        "keyMoney",
        "advanceAmount",
        "leaseDurationMonths",
      ] as const) {
        if (listing[field] != null) {
          context.addIssue({
            code: "custom",
            path: [field],
            message: "This field is only valid for rental listings.",
          })
        }
      }

      if (
        ["active", "reserved"].includes(listing.status) &&
        listing.salePrice == null
      ) {
        context.addIssue({
          code: "custom",
          path: ["salePrice"],
          message: "An active or reserved sale listing requires a sale price.",
        })
      }
    } else {
      if (listing.salePrice != null) {
        context.addIssue({
          code: "custom",
          path: ["salePrice"],
          message: "Sale price is only valid for sale listings.",
        })
      }

      if (
        ["active", "reserved"].includes(listing.status) &&
        listing.monthlyRent == null
      ) {
        context.addIssue({
          code: "custom",
          path: ["monthlyRent"],
          message:
            "An active or reserved rental listing requires monthly rent.",
        })
      }
    }

    if (listing.type === "rent" && ["sold"].includes(listing.status)) {
      context.addIssue({
        code: "custom",
        path: ["status"],
        message: "Rental listings cannot have the sold status.",
      })
    }

    if (listing.type === "sale" && listing.status === "rented") {
      context.addIssue({
        code: "custom",
        path: ["status"],
        message: "Sale listings cannot have the rented status.",
      })
    }
  })

export const listingSearchSchema = z.object({
  query: z.string().trim().max(200).optional(),
  type: z.enum(propertyTypeValues).optional(),
  listingType: z.enum(["sale", "rent"]).optional(),
  city: z.string().trim().max(100).optional(),
  district: z.string().trim().max(100).optional(),
  minPrice: optionalNumber(),
  maxPrice: optionalNumber(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
})

export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type CreateListingInput = z.infer<typeof createListingSchema>
export type ListingSearchInput = z.infer<typeof listingSearchSchema>
