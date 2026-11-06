export function getWhatsAppContactUrl(
  phone: string | null,
  countryCode: string
) {
  if (!phone) return null

  const digits = phone.replace(/\D/g, "")
  if (!digits) return null

  const internationalNumber = digits.startsWith("00")
    ? digits.slice(2)
    : countryCode === "SA" && !digits.startsWith("966")
      ? `966${digits.startsWith("0") ? digits.slice(1) : digits}`
      : digits

  return `https://wa.me/${internationalNumber}`
}
