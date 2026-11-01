import { propertyTypeValues } from "@aqardesk/categories"
import { z } from "zod"

import { optionalNumber, optionalText } from "./fields"

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

    if (listing.type === "rent" && listing.status === "sold") {
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

export type CreateListingInput = z.infer<typeof createListingSchema>
export type ListingSearchInput = z.infer<typeof listingSearchSchema>
