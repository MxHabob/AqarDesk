"use client"

import { Button } from "@aqardesk/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@aqardesk/ui/components/dialog"
import { useState } from "react"
import { useOverlayStore } from "@/components/overlays/overlay-store"
import { useScopedI18n } from "@/locales/client"

export function ConfirmModal() {
  const t = useScopedI18n("modals")
  const common = useScopedI18n("common")
  const confirmation = useOverlayStore((state) => state.confirmation)
  const closeConfirmation = useOverlayStore((state) => state.closeConfirmation)
  const [pending, setPending] = useState(false)

  async function confirm() {
    if (!confirmation) return

    setPending(true)
    try {
      await confirmation.onConfirm()
      closeConfirmation()
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open={confirmation !== null}
      onOpenChange={(open) => {
        if (!open && !pending) closeConfirmation()
      }}
    >
      <DialogContent closeLabel={common("close")}>
        <DialogHeader>
          <DialogTitle>{t("confirmTitle")}</DialogTitle>
          <DialogDescription>{t("confirmDescription")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={pending}
            onClick={closeConfirmation}
          >
            {common("cancel")}
          </Button>
          <Button disabled={pending} onClick={confirm}>
            {pending ? common("saving") : t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
