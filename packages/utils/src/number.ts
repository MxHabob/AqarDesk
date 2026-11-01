type NumberFormatOptions = {
  locale?: string
  options?: Intl.NumberFormatOptions
}

export function formatNumber(
  value: number | string,
  { locale = "ar-SA", options }: NumberFormatOptions = {}
) {
  const number = typeof value === "number" ? value : Number(value)

  if (!Number.isFinite(number)) {
    throw new RangeError(`Expected a finite number, received "${value}".`)
  }

  return new Intl.NumberFormat(locale, options).format(number)
}
