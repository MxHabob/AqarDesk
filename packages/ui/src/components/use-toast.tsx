"use client"

import { type ToastData, toast } from "@aqardesk/ui/components/toast"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"

function useToast() {
  const manager = ToastPrimitive.useToastManager<ToastData>()

  return {
    toasts: manager.toasts,
    toast: manager.add,
    dismiss: manager.close,
    update: manager.update,
    promise: manager.promise,
  }
}

export { toast, useToast }
