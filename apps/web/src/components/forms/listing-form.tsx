"use client"

import {
  type ListingType,
  listingTypesByPropertyType,
  type PropertyType,
} from "@aqardesk/categories"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useRef, useState } from "react"
import type { getListingFormData } from "@/actions/real-estate"
import { saveListingAction } from "@/actions/real-estate"
import {
  RealEstateField,
  RealEstateFormError,
  RealEstateSubmitButton,
} from "@/components/forms/real-estate-fields"

type ListingData = NonNullable<Awaited<ReturnType<typeof getListingFormData>>>
type PropertyOption = {
  id: string
  title: string
  type: PropertyType
  city: string | null
  district: string | null
}

function getAllowedListingTypes(
  properties: PropertyOption[],
  propertyId: string
): readonly ListingType[] {
  const property = properties.find((option) => option.id === propertyId)
  return property ? listingTypesByPropertyType[property.type] : ["sale", "rent"]
}

const listingStatusOptions = {
  sale: [
    { value: "draft", label: "مسودة" },
    { value: "active", label: "نشط" },
    { value: "reserved", label: "محجوز" },
    { value: "sold", label: "مباع" },
    { value: "expired", label: "منتهي" },
    { value: "withdrawn", label: "مسحوب" },
  ],
  rent: [
    { value: "draft", label: "مسودة" },
    { value: "active", label: "نشط" },
    { value: "reserved", label: "محجوز" },
    { value: "rented", label: "مؤجر" },
    { value: "expired", label: "منتهي" },
    { value: "withdrawn", label: "مسحوب" },
  ],
}

export function ListingForm({
  data,
  properties,
  readOnly = false,
  onSaved,
  showSubmitButton = true,
  onPendingChange,
  createAsDraft = false,
}: {
  data?: ListingData
  properties: PropertyOption[]
  readOnly?: boolean
  onSaved?: (listingId: string) => void
  showSubmitButton?: boolean
  onPendingChange?: (pending: boolean) => void
  createAsDraft?: boolean
}) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(saveListingAction, {})
  const joined = data
  const propertyId = joined?.listing.propertyId ?? joined?.property.id
  const isEditing = Boolean(joined?.listing.id)
  const [listingType, setListingType] = useState(data?.listing.type ?? "sale")
  const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId ?? "")
  const handledSavedId = useRef<string | null>(null)

  useEffect(() => {
    if (state.saved && state.id && handledSavedId.current !== state.id) {
      handledSavedId.current = state.id
      router.refresh()
      onSaved?.(state.id)
    }
  }, [onSaved, router, state.id, state.saved])

  useEffect(() => {
    onPendingChange?.(isPending)
  }, [isPending, onPendingChange])

  return (
    <form
      id="listing-form"
      action={formAction}
      className={
        showSubmitButton ? "flex h-full min-h-0 flex-col" : "space-y-6"
      }
    >
      {joined?.listing.id && (
        <input type="hidden" name="id" value={joined.listing.id} />
      )}
      {isEditing && (
        <input type="hidden" name="propertyId" value={propertyId ?? ""} />
      )}
      {createAsDraft && <input type="hidden" name="status" value="draft" />}
      <div
        className={
          showSubmitButton
            ? "scrollbar-hide min-h-0 flex-1 space-y-6 overflow-y-auto"
            : "space-y-6"
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <RealEstateField
            label="العقار"
            name="propertyId"
            type="select"
            defaultValue={propertyId}
            options={[
              { value: "", label: "اختر العقار" },
              ...properties.map((property) => ({
                value: property.id,
                label: `${property.title} — ${property.city ?? ""} ${property.district ?? ""}`,
              })),
            ]}
            onChange={(value) => {
              setSelectedPropertyId(value)
              const selectedProperty = properties.find(
                (property) => property.id === value
              )
              if (!selectedProperty) return
              const allowedTypes =
                listingTypesByPropertyType[selectedProperty.type]
              const nextType = allowedTypes[0]
              if (!allowedTypes.includes(listingType) && nextType) {
                setListingType(nextType)
              }
            }}
            disabled={readOnly || isEditing}
            required
          />
          <RealEstateField
            label="نوع الإعلان"
            name="type"
            type="select"
            defaultValue={listingType}
            disabled={readOnly}
            onChange={(value) => {
              if (value === "sale" || value === "rent") {
                setListingType(value)
              }
            }}
            options={getAllowedListingTypes(properties, selectedPropertyId).map(
              (type) => ({
                value: type,
                label: type === "sale" ? "بيع" : "إيجار",
              })
            )}
            required
          />
          {!createAsDraft && (
            <RealEstateField
              label="الحالة"
              name="status"
              type="select"
              defaultValue={joined?.listing.status ?? "draft"}
              disabled={readOnly}
              options={listingStatusOptions[listingType]}
              required
            />
          )}
          <RealEstateField
            label={listingType === "sale" ? "سعر البيع" : "الإيجار الشهري"}
            name="price"
            type="number"
            min={0}
            step={0.01}
            defaultValue={
              listingType === "sale"
                ? joined?.listing.salePrice
                : joined?.listing.monthlyRent
            }
            disabled={readOnly}
            required
          />
          <RealEstateField
            label="العملة"
            name="currencyCode"
            defaultValue={joined?.listing.currencyCode ?? "SAR"}
            max={3}
            disabled={readOnly}
            required
          />
          {listingType === "rent" && (
            <>
              <RealEstateField
                label="مبلغ السعي"
                name="keyMoney"
                type="number"
                min={0}
                step={0.01}
                defaultValue={joined?.listing.keyMoney}
                disabled={readOnly}
              />
              <RealEstateField
                label="مبلغ الدفعة المقدمة"
                name="advanceAmount"
                type="number"
                min={0}
                step={0.01}
                defaultValue={joined?.listing.advanceAmount}
                disabled={readOnly}
              />
              <RealEstateField
                label="مدة العقد (شهر)"
                name="leaseDurationMonths"
                type="number"
                min={1}
                step={1}
                defaultValue={joined?.listing.leaseDurationMonths}
                disabled={readOnly}
              />
            </>
          )}
          <RealEstateField
            label="الدخل الشهري المتوقع"
            name="expectedMonthlyIncome"
            type="number"
            min={0}
            step={0.01}
            defaultValue={joined?.listing.expectedMonthlyIncome}
            disabled={readOnly}
          />
          <RealEstateField
            label="مصدر الإعلان"
            name="source"
            type="select"
            defaultValue={joined?.listing.source ?? "office"}
            disabled={readOnly}
            options={[
              { value: "office", label: "المكتب" },
              { value: "owner_direct", label: "المالك مباشرة" },
              { value: "external_broker", label: "وسيط خارجي" },
              { value: "referral", label: "إحالة" },
              { value: "other", label: "أخرى" },
            ]}
          />
          <RealEstateField
            label="اسم جهة التواصل"
            name="sourceContactName"
            defaultValue={joined?.listing.sourceContactName}
            disabled={readOnly}
          />
          <RealEstateField
            label="رقم جهة التواصل"
            name="sourceContactPhone"
            type="tel"
            defaultValue={joined?.listing.sourceContactPhone}
            disabled={readOnly}
          />
          <RealEstateField
            label="يتولى المكتب الإعلان"
            name="handledByOffice"
            type="select"
            defaultValue={String(joined?.listing.handledByOffice ?? true)}
            disabled={readOnly}
            options={[
              { value: "true", label: "نعم" },
              { value: "false", label: "لا" },
            ]}
          />
        </div>
        <RealEstateField
          label="ملاحظات عامة"
          name="publicNotes"
          type="textarea"
          defaultValue={joined?.listing.publicNotes}
          disabled={readOnly}
        />
        {!readOnly && (
          <RealEstateField
            label="ملاحظات داخلية"
            name="internalNotes"
            type="textarea"
            defaultValue={joined?.listing.internalNotes}
          />
        )}
      </div>
      {state.error && <RealEstateFormError message={state.error} />}
      {!readOnly && showSubmitButton && (
        <div className="-mx-6 mt-4 border-t bg-[#fafaf9] px-6 pb-2 pt-4 dark:bg-[#0c0c0c]">
          <RealEstateSubmitButton
            label={isEditing ? "حفظ الإعلان" : "إنشاء الإعلان"}
            className="w-full"
            pending={isPending}
          />
        </div>
      )}
    </form>
  )
}
