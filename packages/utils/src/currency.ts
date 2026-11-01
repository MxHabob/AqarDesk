type CurrencyFormatOptions = {
  locale?: string
  options?: Intl.NumberFormatOptions
}

export function formatCurrency(
  value: number | string,
  currencyCode: string,
  { locale = "ar-SA", options }: CurrencyFormatOptions = {}
) {
  const amount = typeof value === "number" ? value : Number(value)

  if (!Number.isFinite(amount)) {
    throw new RangeError(`Expected a finite amount, received "${value}".`)
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    ...options,
  }).format(amount)
}
