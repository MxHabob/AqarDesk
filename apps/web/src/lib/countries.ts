export const countries = [
  { code: "YE", name: "Yemen", nameAr: "اليمن" },
  { code: "SA", name: "Saudi Arabia", nameAr: "المملكة العربية السعودية" },
  {
    code: "AE",
    name: "United Arab Emirates",
    nameAr: "الإمارات العربية المتحدة",
  },
  { code: "BH", name: "Bahrain", nameAr: "البحرين" },
  { code: "KW", name: "Kuwait", nameAr: "الكويت" },
  { code: "OM", name: "Oman", nameAr: "عُمان" },
  { code: "QA", name: "Qatar", nameAr: "قطر" },
  { code: "EG", name: "Egypt", nameAr: "مصر" },
  { code: "JO", name: "Jordan", nameAr: "الأردن" },
  { code: "IQ", name: "Iraq", nameAr: "العراق" },
  { code: "LB", name: "Lebanon", nameAr: "لبنان" },
  { code: "US", name: "United States", nameAr: "الولايات المتحدة" },
  { code: "GB", name: "United Kingdom", nameAr: "المملكة المتحدة" },
  { code: "CA", name: "Canada", nameAr: "كندا" },
  { code: "AU", name: "Australia", nameAr: "أستراليا" },
  { code: "IN", name: "India", nameAr: "الهند" },
  { code: "PK", name: "Pakistan", nameAr: "باكستان" },
] as const

const websiteCountryCodes = ["YE", "EG", "SA", "JO", "QA", "OM"] as const
export const websiteCountries = websiteCountryCodes
  .map((code) => countries.find((country) => country.code === code))
  .filter(
    (country): country is (typeof countries)[number] => country !== undefined
  )

export type CountryCode = (typeof countries)[number]["code"]
export type WebsiteCountryCode = (typeof websiteCountryCodes)[number]

export function isCountryCode(value: string | undefined): value is CountryCode {
  return countries.some((country) => country.code === value)
}

export function isWebsiteCountryCode(
  value: string | undefined
): value is WebsiteCountryCode {
  return websiteCountries.some((country) => country.code === value)
}
