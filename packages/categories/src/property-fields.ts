import type { PropertyType } from "./types"

export type PropertyFieldDefinition = {
  key: string
  label: string
}

export type PropertyFieldSetting = {
  visibleInForm?: boolean
  visiblePublicly?: boolean
  required?: boolean
  label?: string
  order?: number
}

const commonFields: PropertyFieldDefinition[] = [
  { key: "title", label: "اسم العقار" },
  { key: "description", label: "الوصف" },
  { key: "city", label: "المدينة" },
  { key: "district", label: "الحي" },
  { key: "neighborhood", label: "الجوار" },
  { key: "address", label: "الموقع / العنوان" },
  { key: "primaryStreet", label: "الشارع الرئيسي" },
  { key: "secondaryStreet", label: "الشارع الآخر" },
  { key: "lotAreaM2", label: "مساحة الأرض (م²)" },
  { key: "buildingAreaM2", label: "مساحة المبنى (م²)" },
  { key: "frontageM", label: "واجهة الأرض (م)" },
  { key: "depthM", label: "عمق الأرض (م)" },
  { key: "latitude", label: "خط العرض" },
  { key: "longitude", label: "خط الطول" },
]

const categoryFields: Record<PropertyType, PropertyFieldDefinition[]> = {
  building: [
    { key: "currentFloors", label: "عدد الأدوار الحالية" },
    { key: "constructionDesign", label: "التأسيس / التصميم" },
    { key: "deedIssuer", label: "كاتب البصيرة" },
  ],
  land: [{ key: "deedIssuer", label: "كاتب البصيرة" }],
  house_villa: [
    { key: "currentFloors", label: "عدد الأدوار" },
    { key: "apartmentCount", label: "عدد الشقق" },
    { key: "constructionDesign", label: "التأسيس / التصميم" },
    { key: "finish", label: "نوع التشطيب" },
    { key: "hasYard", label: "الحوش" },
    { key: "hasReception", label: "الاستقبال" },
    { key: "isFurnished", label: "مفروش" },
    { key: "hasBasement", label: "بدروم" },
    { key: "hasGuardRoom", label: "غرفة حراسة" },
    { key: "deedIssuer", label: "كاتب البصيرة" },
    { key: "additionalDetails", label: "تفاصيل إضافية" },
  ],
  investment: [
    { key: "investmentType", label: "النوع" },
    { key: "finish", label: "التجهيز / التشطيب" },
    { key: "deedIssuer", label: "كاتب البصيرة" },
    { key: "additionalDetails", label: "تفاصيل إضافية" },
  ],
  commercial: [
    { key: "propertySubtype", label: "النوع" },
    { key: "previousActivity", label: "النشاط السابق" },
    { key: "openingCount", label: "عدد الفتحات" },
    { key: "toiletCount", label: "دورات المياه" },
    { key: "hasStorage", label: "يتبعه مخازن" },
    { key: "storageDetails", label: "تفاصيل المخازن" },
    { key: "additionalDetails", label: "تفاصيل إضافية" },
  ],
  warehouse: [
    { key: "propertySubtype", label: "النوع" },
    { key: "openingCount", label: "عدد الفتحات" },
    { key: "toiletCount", label: "دورات المياه" },
    { key: "additionalDetails", label: "تفاصيل" },
  ],
  yard: [
    { key: "propertySubtype", label: "النوع" },
    { key: "requestedActivity", label: "النشاط المطلوب" },
    { key: "hasFence", label: "السور" },
    { key: "hasRoof", label: "السقف" },
    { key: "toiletCount", label: "دورات المياه" },
    { key: "hasGuardRoom", label: "غرفة حراسة" },
    { key: "additionalDetails", label: "تفاصيل إضافية" },
  ],
  apartment: [
    { key: "roomCount", label: "عدد الغرف" },
    { key: "toiletCount", label: "دورات المياه" },
    { key: "kitchenDetails", label: "المطبخ" },
    { key: "hasSeparateMajlis", label: "مجلس مستقل" },
    { key: "entranceCount", label: "المداخل" },
    { key: "floorNumber", label: "الطابق" },
    { key: "hasYard", label: "الحوش" },
    { key: "isFurnished", label: "مفروش" },
    { key: "buildingType", label: "نوع المبنى" },
    { key: "preferredTenant", label: "نوع المستأجر المطلوب" },
    { key: "additionalDetails", label: "تفاصيل إضافية" },
  ],
}

export const propertyFieldsByType: Record<
  PropertyType,
  PropertyFieldDefinition[]
> = Object.fromEntries(
  Object.entries(categoryFields).map(([type, fields]) => [
    type,
    [...commonFields, ...fields],
  ])
) as Record<PropertyType, PropertyFieldDefinition[]>

export const propertyTypeLabels: Record<PropertyType, string> = {
  building: "عمائر للبيع",
  land: "أراضي للبيع",
  house_villa: "بيوت وفلل",
  investment: "أراضٍ ومبانٍ استثمارية",
  commercial: "تجاري",
  warehouse: "مخازن",
  yard: "أراضٍ وأحواش",
  apartment: "شقق للإيجار",
}
