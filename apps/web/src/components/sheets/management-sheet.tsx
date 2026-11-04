"use client"

import { Button } from "@aqardesk/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@aqardesk/ui/sheet"
import { useState, useTransition } from "react"
import { useScopedI18n } from "@/locales/client"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
}

export function ManagementSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="end"
        className="sm:max-w-2xl"
        panelClassName="flex flex-col overflow-hidden"
      >
        <SheetHeader className="shrink-0 border-b border-border pb-4 pe-10 text-start">
          <SheetTitle className="text-xl font-normal">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-4">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function ManagementForm({
  action,
  onSuccess,
  submitLabel,
  confirmMessage,
  variant = "default",
  compact = false,
  children,
}: {
  action: (formData: FormData) => Promise<void>
  onSuccess: () => void
  submitLabel?: string
  confirmMessage?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive"
  compact?: boolean
  children: React.ReactNode
}) {
  const t = useScopedI18n("accessManagement")
  const [pending, startTransition] = useTransition()
  const [hasError, setHasError] = useState(false)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (confirmMessage && !window.confirm(confirmMessage)) return
        const formData = new FormData(event.currentTarget)
        setHasError(false)
        startTransition(async () => {
          try {
            await action(formData)
            onSuccess()
          } catch (error) {
            console.error("Settings management action failed.", error)
            setHasError(true)
          }
        })
      }}
      className={compact ? "flex" : "flex h-full min-h-0 flex-col"}
    >
      <fieldset
        disabled={pending}
        className={
          compact ? "space-y-5" : "min-h-0 flex-1 space-y-5 overflow-y-auto"
        }
      >
        {children}
      </fieldset>
      {hasError && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {t("actionError")}
        </p>
      )}
      <div
        className={
          compact
            ? "flex"
            : "mt-4 flex shrink-0 justify-end border-t border-border bg-background pt-4"
        }
      >
        <Button type="submit" disabled={pending} variant={variant}>
          {pending ? t("saving") : (submitLabel ?? t("save"))}
        </Button>
      </div>
    </form>
  )
}
