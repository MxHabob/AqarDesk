import type { Locale } from "date-fns"
import { format, isValid, parseISO } from "date-fns"
import { arSA } from "date-fns/locale"

type DateValue = Date | string | number

type DateFormatOptions = {
  locale?: Locale
  formatString?: string
}

function parseDate(value: DateValue) {
  const date = typeof value === "string" ? parseISO(value) : new Date(value)

  if (!isValid(date)) {
    throw new RangeError(`Invalid date value: "${value}".`)
  }

  return date
}

export function formatDate(
  value: DateValue,
  { locale = arSA, formatString = "d MMMM yyyy" }: DateFormatOptions = {}
) {
  return format(parseDate(value), formatString, { locale })
}

export function formatDateTime(
  value: DateValue,
  {
    locale = arSA,
    formatString = "d MMMM yyyy, h:mm a",
  }: DateFormatOptions = {}
) {
  return format(parseDate(value), formatString, { locale })
}
