"use client"

import { cn } from "cn"
import * as React from "react"
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"
import { Label } from "./label"

const Form = FormProvider

type FormFieldContextValue = {
  name: string
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue | null>(null)

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(props: ControllerProps<TFieldValues, TName, TTransformedValues>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  if (!fieldContext) {
    throw new Error("Form field components must be used inside FormField.")
  }

  if (!itemContext) {
    throw new Error("Form field components must be used inside FormItem.")
  }

  const fieldState = getFieldState(
    fieldContext.name as FieldPath<FieldValues>,
    formState
  )

  return {
    ...fieldState,
    id: itemContext.id,
    name: fieldContext.name,
    formItemId: `${itemContext.id}-form-item`,
    formDescriptionId: `${itemContext.id}-form-description`,
    formMessageId: `${itemContext.id}-form-message`,
  }
}

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("space-y-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={Boolean(error)}
      htmlFor={formItemId}
      className={cn(error && "text-destructive", className)}
      {...props}
    />
  )
}

function FormControl({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & { children: React.ReactElement }) {
  const { error, formDescriptionId, formItemId, formMessageId } = useFormField()
  const describedBy = error
    ? `${formDescriptionId} ${formMessageId}`
    : formDescriptionId
  const control = React.cloneElement(
    children as React.ReactElement<Record<string, unknown>>,
    {
      id: formItemId,
      "aria-describedby": describedBy,
      "aria-invalid": Boolean(error),
    }
  )

  return (
    <div data-slot="form-control" className={className} {...props}>
      {control}
    </div>
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const itemContext = React.useContext(FormItemContext)

  return (
    <p
      data-slot="form-description"
      id={itemContext ? `${itemContext.id}-form-description` : undefined}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function FormMessage({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const message = error?.message

  if (!message && !children) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      role={message ? "alert" : undefined}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {message ? String(message) : children}
    </p>
  )
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
}
