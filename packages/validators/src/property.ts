import type { PropertyType } from "@aqardesk/categories"
import { z } from "zod"

import { optionalCount, optionalNumber, optionalText } from "./fields"

const propertyFinishValues = [
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
  finish: z.enum(propertyFinishValues).nullable().optional(),
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
  finish: z.enum(propertyFinishValues).nullable().optional(),
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
    type: z.literal("building" satisfies PropertyType),
    details: buildingDetailsSchema,
  }),
  basePropertySchema.extend({
    type: z.literal("land" satisfies PropertyType),
    details: landDetailsSchema,
  }),
  basePropertySchema.extend({
    type: z.literal("house_villa" satisfies PropertyType),
    details: houseVillaDetailsSchema,
  }),
  basePropertySchema.extend({
    type: z.literal("investment" satisfies PropertyType),
    details: investmentDetailsSchema,
  }),
  basePropertySchema.extend({
    type: z.literal("commercial" satisfies PropertyType),
    details: commercialDetailsSchema,
  }),
  basePropertySchema.extend({
    type: z.literal("warehouse" satisfies PropertyType),
    details: warehouseDetailsSchema,
  }),
  basePropertySchema.extend({
    type: z.literal("yard" satisfies PropertyType),
    details: yardDetailsSchema,
  }),
  basePropertySchema.extend({
    type: z.literal("apartment" satisfies PropertyType),
    details: apartmentDetailsSchema,
  }),
])

export type CreatePropertyInput = z.infer<typeof createPropertySchema>
