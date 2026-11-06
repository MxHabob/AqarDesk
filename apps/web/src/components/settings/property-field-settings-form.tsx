"use client"

import { Button } from "@aqardesk/ui/button"
import { AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"
import { useEffect, useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { BottomBar } from "@/components/tables/core/bottom-bar"
import { useScopedI18n } from "@/locales/client"

const formId = "property-field-settings-form"

function getFormValues(form: HTMLFormElement) {
  return JSON.stringify(Array.from(new FormData(form).entries()))
}

function SaveChangesBar({ formId }: { formId: string }) {
  const { pending } = useFormStatus()
  const t = useScopedI18n("propertyFieldSettings")

  return (
    <BottomBar position="top" statusLabel={t("unsavedChanges")}>
      <Button type="submit" form={formId} size="sm" disabled={pending}>
        {pending && (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        )}
        {t("save")}
      </Button>
    </BottomBar>
  )
}

export function PropertyFieldSettingsForm({
  action,
  children,
}: {
  action: (formData: FormData) => Promise<void>
  children: ReactNode
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const initialValues = useRef<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (formRef.current) {
      initialValues.current = getFormValues(formRef.current)
    }
  }, [])

  const updateDirtyState = () => {
    if (formRef.current && initialValues.current !== null) {
      setHasChanges(getFormValues(formRef.current) !== initialValues.current)
    }
  }

  return (
    <form
      ref={formRef}
      id={formId}
      action={action}
      onChange={updateDirtyState}
      className="space-y-4"
    >
      {children}
      <AnimatePresence>
        {hasChanges && <SaveChangesBar formId={formId} />}
      </AnimatePresence>
    </form>
  )
}
