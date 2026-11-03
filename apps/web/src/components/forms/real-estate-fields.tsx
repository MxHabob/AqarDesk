"use client"

import { Button } from "@aqardesk/ui/components/button"
import { useFormStatus } from "react-dom"

type Option = { value: string; label: string }

export function RealEstateField({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  disabled,
  placeholder,
  min,
  max,
  step,
  options,
  rows,
  onChange,
}: {
  label: string
  name: string
  defaultValue?: string | number | null
  type?: "text" | "number" | "tel" | "email" | "textarea" | "select"
  required?: boolean
  disabled?: boolean
  placeholder?: string
  min?: number
  max?: number
  step?: number
  options?: Option[]
  rows?: number
  onChange?: (value: string) => void
}) {
  const controlClass =
    "h-9 w-full border bg-transparent px-3 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
  const value = defaultValue ?? ""
  const controlId = `real-estate-${name}`

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label
        htmlFor={controlId}
        className="text-sm font-medium leading-none text-foreground"
      >
        <span>{label}</span>
      </label>
      {type === "textarea" ? (
        <textarea
          id={controlId}
          className={`${controlClass} h-auto min-h-[60px] resize-y py-2`}
          name={name}
          defaultValue={String(value)}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows ?? 3}
        />
      ) : type === "select" ? (
        <select
          id={controlId}
          className={controlClass}
          name={name}
          defaultValue={String(value)}
          required={required}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.value)}
        >
          {(options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={controlId}
          className={controlClass}
          name={name}
          type={type}
          defaultValue={String(value)}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange?.(event.target.value)}
        />
      )}
    </div>
  )
}

export function RealEstateSubmitButton({
  label,
  disabled,
  className,
  form,
  pending,
}: {
  label: string
  disabled?: boolean
  className?: string
  form?: string
  pending?: boolean
}) {
  const { pending: formPending } = useFormStatus()
  const isPending = pending ?? formPending

  return (
    <Button
      type="submit"
      form={form}
      disabled={disabled || isPending}
      className={className}
    >
      {isPending ? "جارٍ الحفظ..." : label}
    </Button>
  )
}

export function RealEstateFormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  )
}
