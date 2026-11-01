"use client"

import { Button } from "@aqardesk/ui/components/button"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cn } from "cn"
import {
  CircleCheckIcon,
  InfoIcon,
  LoaderCircleIcon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import type * as React from "react"

export type ToastKind =
  | "default"
  | "success"
  | "error"
  | "info"
  | "warning"
  | "loading"

export interface ToastData {
  progress?: number
  footer?: React.ReactNode
}

export const toast = ToastPrimitive.createToastManager<ToastData>()

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:end-auto sm:start-4 sm:mx-0 sm:w-full",
        className
      )}
      {...props}
    />
  )
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group/toast pointer-events-auto relative flex w-full flex-col gap-3 overflow-hidden border bg-[#f6f6f3] p-5 text-foreground shadow-lg outline-none transition-all data-ending-style:animate-out data-ending-style:fade-out-80 data-ending-style:slide-out-to-left-full data-starting-style:animate-in data-starting-style:fade-in-0 data-starting-style:slide-in-from-bottom-full dark:bg-secondary",
        "data-[type=error]:border-destructive data-[type=error]:text-destructive data-[type=success]:border-emerald-600/30 data-[type=warning]:border-amber-600/30",
        className
      )}
      {...props}
    />
  )
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn("flex w-full items-start gap-3", className)}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-xs leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  )
}

function ToastClose({
  className,
  render = <Button variant="ghost" size="icon-xs" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="إغلاق التنبيه"
      render={render}
      className={cn(
        "absolute end-2 top-2 text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    >
      <XIcon aria-hidden="true" />
    </ToastPrimitive.Close>
  )
}

function ToastIcon({ type }: { type?: string }) {
  const iconProps = {
    "aria-hidden": true as const,
    className: "size-4 shrink-0",
  }

  switch (type) {
    case "success":
      return (
        <CircleCheckIcon
          {...iconProps}
          className="size-4 shrink-0 text-emerald-600"
        />
      )
    case "error":
      return (
        <OctagonXIcon
          {...iconProps}
          className="size-4 shrink-0 text-destructive"
        />
      )
    case "info":
      return (
        <InfoIcon
          {...iconProps}
          className="size-4 shrink-0 text-muted-foreground"
        />
      )
    case "warning":
      return (
        <TriangleAlertIcon
          {...iconProps}
          className="size-4 shrink-0 text-amber-600"
        />
      )
    case "loading":
      return (
        <LoaderCircleIcon
          {...iconProps}
          className="size-4 shrink-0 animate-spin"
        />
      )
    default:
      return null
  }
}

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastIcon,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
}
