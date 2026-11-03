"use client"

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
    "h-10 w-full border-0 border-b border-input bg-transparent px-0 text-sm outline-none focus:border-ring disabled:opacity-50"
  const value = defaultValue ?? ""
  const controlId = `real-estate-${name}`

  return (
    <div className="flex min-w-0 flex-col gap-1.5 text-xs text-muted-foreground">
      <label htmlFor={controlId}>
        <span>{label}</span>
      </label>
      {type === "textarea" ? (
        <textarea
          id={controlId}
          className={`${controlClass} h-auto min-h-20 resize-y py-2`}
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
}: {
  label: string
  disabled?: boolean
}) {
  const { pending } = useFormStatus()

  return (
    <button
      className="h-10 bg-primary px-6 text-xs font-semibold uppercase tracking-widest text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      type="submit"
      disabled={disabled || pending}
    >
      {pending ? "جارٍ الحفظ..." : label}
    </button>
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
