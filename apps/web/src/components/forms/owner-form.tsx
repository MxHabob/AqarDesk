"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aqardesk/ui/select"
import { useRouter } from "next/navigation"
import { useActionState, useEffect } from "react"
import type { getOwnerFormData } from "@/actions/real-estate"
import { saveOwnerAction } from "@/actions/real-estate"
import {
  RealEstateField,
  RealEstateFormError,
  RealEstateSubmitButton,
} from "@/components/forms/real-estate-fields"

type OwnerData = NonNullable<Awaited<ReturnType<typeof getOwnerFormData>>>

export function OwnerForm({
  data,
  readOnly = false,
  onSaved,
}: {
  data?: OwnerData
  readOnly?: boolean
  onSaved?: () => void
}) {
  const router = useRouter()
  const [state, formAction] = useActionState(saveOwnerAction, {})
  const phones = data?.phones.map(({ phoneNumber }) => phoneNumber).join("\n")
  const whatsappPhones = data?.phones
    .filter(({ isWhatsapp }) => isWhatsapp)
    .map(({ phoneNumber }) => phoneNumber)
    .join("\n")

  useEffect(() => {
    if (state.saved) {
      router.refresh()
      onSaved?.()
    }
  }, [onSaved, router, state.saved])

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      {data?.owner.id && (
        <input type="hidden" name="id" value={data.owner.id} />
      )}
      <div className="scrollbar-hide min-h-0 flex-1 space-y-6 overflow-y-auto">
        <RealEstateField
          label="اسم المالك"
          name="name"
          defaultValue={data?.owner.name}
          required
          disabled={readOnly}
        />
        <RealEstateField
          label="أرقام التواصل"
          name="phones"
          type="textarea"
          defaultValue={phones}
          placeholder="رقم هاتف في كل سطر"
          disabled={readOnly}
        />
        <RealEstateField
          label="أرقام واتساب"
          name="whatsappPhones"
          type="textarea"
          defaultValue={whatsappPhones}
          placeholder="رقم واتساب واحد في كل سطر، ويجب أن يكون ضمن أرقام التواصل"
          disabled={readOnly}
        />
        <p className="-mt-3 text-xs text-muted-foreground">
          حدّد أرقام واتساب من أرقام التواصل المسجلة. لا تشارك بيانات المالك في
          الروابط العامة.
        </p>
        <div className="space-y-2 text-sm font-medium">
          <label htmlFor="owner-offer-types">أنواع العروض</label>
          <Select
            name="offerTypes"
            multiple
            defaultValue={data?.owner.offerTypes ?? []}
            disabled={readOnly}
            items={[
              { value: "sale", label: "بيع" },
              { value: "rent", label: "إيجار" },
            ]}
          >
            <SelectTrigger
              id="owner-offer-types"
              className="h-auto min-h-10 w-full bg-transparent py-2"
            >
              <SelectValue placeholder="اختر أنواع العروض" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="sale">بيع</SelectItem>
              <SelectItem value="rent">إيجار</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <RealEstateField
          label="نوع المبنى"
          name="buildingType"
          defaultValue={data?.owner.buildingType}
          disabled={readOnly}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <RealEstateField
            label="الموقع / المدينة"
            name="city"
            defaultValue={data?.owner.city}
            disabled={readOnly}
          />
          <RealEstateField
            label="الحي"
            name="district"
            defaultValue={data?.owner.district}
            disabled={readOnly}
          />
          <RealEstateField
            label="الجوار"
            name="neighborhood"
            defaultValue={data?.owner.neighborhood}
            disabled={readOnly}
          />
          <RealEstateField
            label="الشارع"
            name="street"
            defaultValue={data?.owner.street}
            disabled={readOnly}
          />
        </div>
        <RealEstateField
          label="التواصل عبر المكتب"
          name="contactViaOffice"
          type="select"
          defaultValue={String(data?.owner.contactViaOffice ?? true)}
          disabled={readOnly}
          options={[
            { value: "true", label: "نعم" },
            { value: "false", label: "لا" },
          ]}
        />
        <RealEstateField
          label="ملاحظات داخلية"
          name="notes"
          type="textarea"
          defaultValue={data?.owner.notes}
          disabled={readOnly}
        />
        {state.error && <RealEstateFormError message={state.error} />}
      </div>
      {!readOnly && (
        <div className="-mx-6 mt-4 border-t bg-[#fafaf9] px-6 pb-2 pt-4 dark:bg-[#0c0c0c]">
          <RealEstateSubmitButton
            label={data ? "حفظ المالك" : "إضافة مالك"}
            className="w-full"
          />
        </div>
      )}
    </form>
  )
}
