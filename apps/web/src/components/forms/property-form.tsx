"use client"

import { propertyCategories } from "@aqardesk/categories"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aqardesk/ui/select"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"
import type {
  getPropertyFormData,
  getPropertyOwnerOptions,
} from "@/actions/real-estate"
import { savePropertyAction } from "@/actions/real-estate"
import {
  RealEstateField,
  RealEstateFormError,
  RealEstateSubmitButton,
} from "@/components/forms/real-estate-fields"

type PropertyData = NonNullable<Awaited<ReturnType<typeof getPropertyFormData>>>

const finishOptions = [
  { value: "", label: "غير محدد" },
  { value: "unfinished", label: "غير مكتمل" },
  { value: "basic", label: "أساسي" },
  { value: "good", label: "جيد" },
  { value: "excellent", label: "ممتاز" },
  { value: "luxury", label: "فاخر" },
  { value: "other", label: "أخرى" },
]

const yesNoOptions = [
  { value: "", label: "غير محدد" },
  { value: "true", label: "نعم" },
  { value: "false", label: "لا" },
]

const detailsFields: Record<
  string,
  Array<{
    name: string
    label: string
    type?: "text" | "number" | "textarea" | "select"
    options?: Array<{ value: string; label: string }>
  }>
> = {
  building: [
    { name: "currentFloors", label: "عدد الأدوار", type: "number" },
    { name: "constructionDesign", label: "التصميم الإنشائي" },
    { name: "deedIssuer", label: "جهة إصدار الصك" },
  ],
  land: [{ name: "deedIssuer", label: "جهة إصدار الصك" }],
  house_villa: [
    { name: "currentFloors", label: "عدد الأدوار", type: "number" },
    { name: "apartmentCount", label: "عدد الشقق", type: "number" },
    { name: "constructionDesign", label: "التصميم الإنشائي" },
    {
      name: "finish",
      label: "التشطيب",
      type: "select",
      options: finishOptions,
    },
    { name: "hasYard", label: "حوش", type: "select", options: yesNoOptions },
    {
      name: "hasReception",
      label: "مجلس",
      type: "select",
      options: yesNoOptions,
    },
    {
      name: "isFurnished",
      label: "مفروش",
      type: "select",
      options: yesNoOptions,
    },
    {
      name: "hasBasement",
      label: "قبو",
      type: "select",
      options: yesNoOptions,
    },
    {
      name: "hasGuardRoom",
      label: "غرفة حارس",
      type: "select",
      options: yesNoOptions,
    },
    { name: "deedIssuer", label: "جهة إصدار الصك" },
  ],
  investment: [
    { name: "investmentType", label: "نوع الاستثمار" },
    {
      name: "finish",
      label: "التشطيب",
      type: "select",
      options: finishOptions,
    },
    { name: "deedIssuer", label: "جهة إصدار الصك" },
    { name: "additionalDetails", label: "تفاصيل إضافية", type: "textarea" },
  ],
  commercial: [
    { name: "previousActivity", label: "النشاط السابق" },
    { name: "openingCount", label: "عدد الفتحات", type: "number" },
    { name: "toiletCount", label: "عدد دورات المياه", type: "number" },
    {
      name: "hasStorage",
      label: "مستودع",
      type: "select",
      options: yesNoOptions,
    },
    { name: "storageDetails", label: "تفاصيل المستودع", type: "textarea" },
    { name: "additionalDetails", label: "تفاصيل إضافية", type: "textarea" },
  ],
  warehouse: [
    { name: "openingCount", label: "عدد الفتحات", type: "number" },
    { name: "toiletCount", label: "عدد دورات المياه", type: "number" },
    { name: "additionalDetails", label: "تفاصيل إضافية", type: "textarea" },
  ],
  yard: [
    { name: "requestedActivity", label: "النشاط المطلوب" },
    { name: "hasFence", label: "مسوّر", type: "select", options: yesNoOptions },
    { name: "hasRoof", label: "مغطى", type: "select", options: yesNoOptions },
    { name: "toiletCount", label: "عدد دورات المياه", type: "number" },
    {
      name: "hasGuardRoom",
      label: "غرفة حارس",
      type: "select",
      options: yesNoOptions,
    },
    { name: "additionalDetails", label: "تفاصيل إضافية", type: "textarea" },
  ],
  apartment: [
    { name: "roomCount", label: "عدد الغرف", type: "number" },
    { name: "toiletCount", label: "عدد دورات المياه", type: "number" },
    { name: "kitchenDetails", label: "تفاصيل المطبخ", type: "textarea" },
    {
      name: "hasSeparateMajlis",
      label: "مجلس مستقل",
      type: "select",
      options: yesNoOptions,
    },
    { name: "entranceCount", label: "عدد المداخل", type: "number" },
    { name: "floorNumber", label: "رقم الدور" },
    { name: "hasYard", label: "حوش", type: "select", options: yesNoOptions },
    {
      name: "isFurnished",
      label: "مفروش",
      type: "select",
      options: yesNoOptions,
    },
    { name: "buildingType", label: "نوع المبنى" },
    {
      name: "preferredTenant",
      label: "المستأجر المفضل",
      type: "select",
      options: [
        { value: "", label: "غير محدد" },
        { value: "family", label: "عائلة" },
        { value: "office", label: "مكتب" },
        { value: "bachelors", label: "أفراد" },
        { value: "other", label: "أخرى" },
      ],
    },
    { name: "additionalDetails", label: "تفاصيل إضافية", type: "textarea" },
  ],
}

function getDetailValue(details: object | undefined, name: string) {
  const entry = details
    ? Object.entries(details).find(([key]) => key === name)
    : undefined
  const value = entry?.[1]
  if (typeof value === "boolean") return String(value)
  if (typeof value === "string" || typeof value === "number") return value
  return ""
}

export function PropertyForm({
  data,
  ownerOptions = [],
  readOnly = false,
  onSaved,
}: {
  data?: PropertyData
  ownerOptions?: Awaited<ReturnType<typeof getPropertyOwnerOptions>>
  readOnly?: boolean
  onSaved?: () => void
}) {
  const router = useRouter()
  const [state, formAction] = useActionState(savePropertyAction, {})
  const [propertyType, setPropertyType] = useState(
    data?.property.type ?? "land"
  )
  const isEditing = Boolean(data?.property.id)
  const details = data?.details ?? undefined

  useEffect(() => {
    if (state.saved) {
      router.refresh()
      onSaved?.()
    }
  }, [onSaved, router, state.saved])

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      {data?.property.id && (
        <input type="hidden" name="id" value={data.property.id} />
      )}
      {isEditing && <input type="hidden" name="type" value={propertyType} />}
      <div className="scrollbar-hide min-h-0 flex-1 space-y-6 overflow-y-auto">
        <div className="grid gap-4 sm:grid-cols-2">
          <RealEstateField
            label="نوع العقار"
            name="type"
            type="select"
            defaultValue={propertyType}
            disabled={readOnly || isEditing}
            options={propertyCategories.map((category) => ({
              value: category.type,
              label: category.nameAr,
            }))}
            onChange={(value) => {
              const category = propertyCategories.find(
                (option) => option.type === value
              )
              if (category) setPropertyType(category.type)
            }}
            required
          />
          <RealEstateField
            label="اسم العقار"
            name="title"
            defaultValue={data?.property.title}
            required
            disabled={readOnly}
            placeholder="مثال: فيلا في حي..."
          />
        </div>
        <RealEstateField
          label="الوصف"
          name="description"
          type="textarea"
          defaultValue={data?.property.description}
          disabled={readOnly}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <RealEstateField
            label="المدينة"
            name="city"
            defaultValue={data?.property.city}
            disabled={readOnly}
          />
          <RealEstateField
            label="الحي"
            name="district"
            defaultValue={data?.property.district}
            disabled={readOnly}
          />
          <RealEstateField
            label="المنطقة / الحي الفرعي"
            name="neighborhood"
            defaultValue={data?.property.neighborhood}
            disabled={readOnly}
          />
          <RealEstateField
            label="العنوان"
            name="address"
            defaultValue={data?.property.address}
            disabled={readOnly}
          />
          <RealEstateField
            label="الشارع الرئيسي"
            name="primaryStreet"
            defaultValue={data?.property.primaryStreet}
            disabled={readOnly}
          />
          <RealEstateField
            label="الشارع الفرعي"
            name="secondaryStreet"
            defaultValue={data?.property.secondaryStreet}
            disabled={readOnly}
          />
          <RealEstateField
            label="مساحة الأرض (م²)"
            name="lotAreaM2"
            type="number"
            min={0}
            step={0.01}
            defaultValue={data?.property.lotAreaM2}
            disabled={readOnly}
          />
          <RealEstateField
            label="مساحة البناء (م²)"
            name="buildingAreaM2"
            type="number"
            min={0}
            step={0.01}
            defaultValue={data?.property.buildingAreaM2}
            disabled={readOnly}
          />
          <RealEstateField
            label="الواجهة (م)"
            name="frontageM"
            type="number"
            min={0}
            step={0.01}
            defaultValue={data?.property.frontageM}
            disabled={readOnly}
          />
          <RealEstateField
            label="العمق (م)"
            name="depthM"
            type="number"
            min={0}
            step={0.01}
            defaultValue={data?.property.depthM}
            disabled={readOnly}
          />
          <RealEstateField
            label="خط العرض"
            name="latitude"
            type="number"
            min={-90}
            max={90}
            step={0.000001}
            defaultValue={data?.property.latitude}
            disabled={readOnly}
          />
          <RealEstateField
            label="خط الطول"
            name="longitude"
            type="number"
            min={-180}
            max={180}
            step={0.000001}
            defaultValue={data?.property.longitude}
            disabled={readOnly}
          />
        </div>

        <div className="flex flex-col gap-2 text-sm font-medium">
          <label htmlFor="property-owners">الملاك</label>
          <Select
            name="ownerIds"
            multiple
            defaultValue={data?.ownerRows.map(({ ownerId }) => ownerId) ?? []}
            disabled={readOnly}
            items={ownerOptions.map((owner) => ({
              value: owner.id,
              label: owner.name,
            }))}
          >
            <SelectTrigger
              id="property-owners"
              className="h-auto min-h-24 w-full items-start bg-transparent py-2"
            >
              <SelectValue placeholder="اختر الملاك" />
            </SelectTrigger>
            <SelectContent align="start">
              {ownerOptions.map((owner) => (
                <SelectItem key={owner.id} value={owner.id}>
                  {owner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs font-normal text-muted-foreground">
            يمكن اختيار أكثر من مالك. أضف المالك أولًا من صفحة الملاك.
          </span>
        </div>

        <h3 className="border-b pb-2 text-sm font-medium">مواصفات العقار</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {(detailsFields[propertyType] ?? []).map((field) => (
            <RealEstateField
              key={field.name}
              {...field}
              defaultValue={getDetailValue(details, field.name)}
              disabled={readOnly}
              min={field.type === "number" ? 0 : undefined}
              step={field.type === "number" ? 1 : undefined}
            />
          ))}
        </div>
        {state.error && <RealEstateFormError message={state.error} />}
      </div>
      {!readOnly && (
        <div className="-mx-6 mt-4 border-t bg-[#fafaf9] px-6 pb-2 pt-4 dark:bg-[#0c0c0c]">
          <RealEstateSubmitButton
            label={isEditing ? "حفظ التعديلات" : "إضافة العقار"}
            className="w-full"
          />
        </div>
      )}
    </form>
  )
}
