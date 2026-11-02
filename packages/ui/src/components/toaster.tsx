"use client"

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  type ToastData,
  ToastDescription,
  ToastIcon,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toast,
} from "@aqardesk/ui/components/toast"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cn } from "cn"
import type * as React from "react"

interface ToasterProps
  extends Omit<ToastPrimitive.Provider.Props, "children" | "toastManager"> {
  children?: React.ReactNode
  toastManager?: typeof toast
  className?: string
  closeLabel?: string
}

function ToastList({
  className,
  closeLabel,
}: {
  className?: string
  closeLabel?: string
}) {
  const { toasts } = ToastPrimitive.useToastManager<ToastData>()

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem} className={className}>
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {toastItem.title && <ToastTitle>{toastItem.title}</ToastTitle>}
          {toastItem.description && (
            <ToastDescription>{toastItem.description}</ToastDescription>
          )}
          {toastItem.data?.progress !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <div
                className="h-[3px] flex-1 bg-muted"
                role="progressbar"
                aria-valuenow={toastItem.data.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full bg-primary transition-[width]"
                  style={{ width: `${toastItem.data.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {toastItem.data.progress}%
              </span>
            </div>
          )}
        </div>
        {toastItem.actionProps && <ToastAction {...toastItem.actionProps} />}
        <ToastClose closeLabel={closeLabel} />
      </ToastContent>
      {toastItem.data?.footer && (
        <div className="flex w-full justify-end border-t pt-3">
          {toastItem.data.footer}
        </div>
      )}
    </Toast>
  ))
}

function Toaster({
  children,
  toastManager = toast,
  className,
  limit = 3,
  timeout = 5000,
  closeLabel,
  ...props
}: ToasterProps) {
  return (
    <ToastProvider
      toastManager={toastManager}
      limit={limit}
      timeout={timeout}
      {...props}
    >
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList className={cn(className)} closeLabel={closeLabel} />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  )
}

export { Toaster }
