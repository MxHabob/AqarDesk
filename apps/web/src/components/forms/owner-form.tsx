"use client"

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

  useEffect(() => {
    if (state.saved) {
      router.refresh()
      onSaved?.()
    }
  }, [onSaved, router, state.saved])

  return (
    <form action={formAction} className="flex h-full flex-col gap-5">
      {data?.owner.id && (
        <input type="hidden" name="id" value={data.owner.id} />
      )}
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
      <p className="-mt-3 text-xs text-muted-foreground">
        أضف رقمًا واحدًا في كل سطر. لا تشارك بيانات المالك في الروابط العامة.
      </p>
      <RealEstateField
        label="ملاحظات داخلية"
        name="notes"
        type="textarea"
        defaultValue={data?.owner.notes}
        disabled={readOnly}
      />
      {state.error && <RealEstateFormError message={state.error} />}
      {!readOnly && (
        <div className="mt-auto flex justify-end border-t pt-4">
          <RealEstateSubmitButton label={data ? "حفظ المالك" : "إضافة مالك"} />
        </div>
      )}
    </form>
  )
}
