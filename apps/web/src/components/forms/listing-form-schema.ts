import { propertyTypeValues } from "@aqardesk/categories"
import { z } from "zod"

const optionalPositiveNumber = z
  .string()
  .optional()
  .refine(
    (value) =>
      !value?.trim() || (Number.isFinite(Number(value)) && Number(value) > 0),
    "invalidNumber"
  )

export const listingFormSchema = z.object({
  title: z.string().trim().min(1, "required").max(200),
  propertyType: z.enum(propertyTypeValues),
  listingType: z.enum(["sale", "rent"]),
  city: z.string().trim().optional(),
  district: z.string().trim().optional(),
  area: optionalPositiveNumber,
  price: z
    .string()
    .trim()
    .min(1, "required")
    .refine(
      (value) => Number.isFinite(Number(value)) && Number(value) > 0,
      "invalidNumber"
    ),
})

export type ListingFormInput = z.infer<typeof listingFormSchema>
