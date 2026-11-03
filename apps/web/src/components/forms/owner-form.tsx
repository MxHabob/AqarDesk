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
