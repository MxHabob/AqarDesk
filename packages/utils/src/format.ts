type NumericValue = number | string

function toFiniteNumber(value: NumericValue) {
  const number = typeof value === "number" ? value : Number(value)

  if (!Number.isFinite(number)) {
    throw new RangeError(`Expected a finite number, received "${value}".`)
  }

  return number
}

export function formatNumber(
  value: NumericValue,
  options: {
    locale?: string
    number?: Intl.NumberFormatOptions
  } = {}
) {
  return new Intl.NumberFormat(
    options.locale ?? "ar-SA",
    options.number
  ).format(toFiniteNumber(value))
}

export function formatCurrency(
  value: NumericValue,
  currencyCode: string,
  options: {
    locale?: string
    currency?: Intl.NumberFormatOptions
  } = {}
) {
  return new Intl.NumberFormat(options.locale ?? "ar-SA", {
    style: "currency",
    currency: currencyCode,
    ...options.currency,
  }).format(toFiniteNumber(value))
}

export function formatDate(
  value: Date | string | number,
  locale = "ar-SA-u-ca-gregory",
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value))
}

export function formatDateTime(
  value: Date | string | number,
  locale = "ar-SA-u-ca-gregory",
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  }
) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value))
}
