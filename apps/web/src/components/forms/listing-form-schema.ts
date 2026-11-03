import { propertyTypeValues } from "@aqardesk/categories"
import { z } from "zod"

export const listingFormSchema = z.object({
  propertyType: z.enum(propertyTypeValues),
  listingType: z.enum(["sale", "rent"]),
  title: z.string().trim().min(2).max(200),
  city: z.string().trim().optional(),
  district: z.string().trim().optional(),
  area: z.string().trim().optional(),
  price: z.number().positive(),
})
