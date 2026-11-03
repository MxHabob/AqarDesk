import { format } from "date-fns"

const countryFiscalYearStartMonths: Record<string, number> = {
  AU: 7,
  EG: 7,
  GB: 4,
  HK: 4,
  IN: 4,
  NZ: 4,
  PK: 7,
  SG: 4,
  ZA: 3,
}

function validateFiscalYearStartMonth(month: number | null | undefined) {
  if (month != null && (!Number.isInteger(month) || month < 1 || month > 12)) {
    throw new RangeError("Fiscal year start month must be between 1 and 12.")
  }
}

function validateReferenceDate(date: Date) {
  if (!Number.isFinite(date.getTime())) {
    throw new RangeError("Reference date must be a valid date.")
  }
}

export function getDefaultFiscalYearStartMonth(
  countryCode: string | null | undefined
): number {
  const normalizedCode = countryCode?.trim().toUpperCase()

  if (!normalizedCode || !/^[A-Z]{2}$/.test(normalizedCode)) {
    return 1
  }

  return countryFiscalYearStartMonths[normalizedCode] ?? 1
}

export function getFiscalYearLabel(month: number | null): string {
  validateFiscalYearStartMonth(month)

  if (month == null) {
    return "Trailing 12 months"
  }

  return format(new Date(2024, month - 1, 1), "MMMM")
}

export function getFiscalYearDates(
  fiscalYearStartMonth: number | null | undefined,
  referenceDate = new Date()
): { from: Date; to: Date } {
  validateFiscalYearStartMonth(fiscalYearStartMonth)
  validateReferenceDate(referenceDate)

  if (fiscalYearStartMonth == null) {
    return {
      from: new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth() - 11,
        1
      ),
      to: new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth() + 1,
        0
      ),
    }
  }

  const year = referenceDate.getFullYear()
  const currentYearStart = new Date(year, fiscalYearStartMonth - 1, 1)
  const from =
    referenceDate < currentYearStart
      ? new Date(year - 1, fiscalYearStartMonth - 1, 1)
      : currentYearStart

  return {
    from,
    to: new Date(from.getFullYear() + 1, from.getMonth(), 0),
  }
}

export function getFiscalYearToDate(
  fiscalYearStartMonth: number | null | undefined,
  referenceDate = new Date()
): { from: Date; to: Date } {
  const { from } = getFiscalYearDates(fiscalYearStartMonth, referenceDate)
  return { from, to: new Date(referenceDate) }
}
