"use client"

import { Button } from "@aqardesk/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aqardesk/ui/select"
import { useEffect, useState } from "react"
import { useFormStatus } from "react-dom"

type Option = { value: string; label: string }
const EMPTY_SELECT_VALUE = "__aqardesk_empty__"

function RealEstateSelectField({
  controlClass,
  controlId,
  defaultValue,
  disabled,
  name,
  onChange,
  options = [],
  placeholder,
  required,
}: {
  controlClass: string
  controlId: string
  defaultValue: string
  disabled?: boolean
  name: string
  onChange?: (value: string) => void
  options?: Option[]
  placeholder?: string
  required?: boolean
}) {
  const emptyOption = options.find((option) => option.value === "")
  const initialValue = defaultValue || (required ? "" : EMPTY_SELECT_VALUE)
  const [selectedValue, setSelectedValue] = useState(initialValue)

  useEffect(() => {
    if (!selectedValue || selectedValue === EMPTY_SELECT_VALUE) return

    const hasCurrentOption = options.some((option) =>
      option.value === ""
        ? selectedValue === EMPTY_SELECT_VALUE || selectedValue === ""
        : option.value === selectedValue
    )
    if (hasCurrentOption) return

    const nextValue =
      options.find((option) => option.value !== "")?.value ??
      (required ? "" : EMPTY_SELECT_VALUE)
    setSelectedValue(nextValue)
    onChange?.(nextValue === EMPTY_SELECT_VALUE ? "" : nextValue)
  }, [onChange, options, required, selectedValue])

  return (
    <Select
      name={name}
      value={selectedValue || null}
      required={required}
      disabled={disabled}
      itemToStringValue={(value) =>
        value === EMPTY_SELECT_VALUE ? "" : String(value ?? "")
      }
      onValueChange={(value) => {
        const nextValue =
          value === EMPTY_SELECT_VALUE
            ? EMPTY_SELECT_VALUE
            : String(value ?? "")
        setSelectedValue(nextValue)
        onChange?.(nextValue === EMPTY_SELECT_VALUE ? "" : nextValue)
      }}
      items={options.map((option) => ({
        value: option.value === "" ? EMPTY_SELECT_VALUE : option.value,
        label: option.label,
      }))}
    >
      <SelectTrigger
        id={controlId}
        className={`${controlClass} justify-between`}
      >
        <SelectValue placeholder={emptyOption?.label ?? placeholder} />
      </SelectTrigger>
      <SelectContent align="start">
        {options.map((option) => (
          <SelectItem
            key={option.value || EMPTY_SELECT_VALUE}
            value={option.value === "" ? EMPTY_SELECT_VALUE : option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
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
        <RealEstateSelectField
          controlClass={controlClass}
          controlId={controlId}
          name={name}
          defaultValue={String(value)}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          options={options}
          onChange={onChange}
        />
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
