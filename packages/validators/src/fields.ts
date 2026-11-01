import { z } from "zod"

export const optionalText = z.string().trim().max(2000).nullable().optional()

export const optionalNumber = (min = 0, max = Number.MAX_SAFE_INTEGER) =>
  z.preprocess(
    (value) =>
      value === null
        ? null
        : value === "" || value === undefined
          ? undefined
          : value,
    z.coerce.number().finite().min(min).max(max).nullable().optional()
  )

export const optionalCount = z.preprocess(
  (value) =>
    value === null
      ? null
      : value === "" || value === undefined
        ? undefined
        : value,
  z.coerce.number().int().min(0).nullable().optional()
)
