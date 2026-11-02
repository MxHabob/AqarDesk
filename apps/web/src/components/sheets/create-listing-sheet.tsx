"use client"

import { Button } from "@aqardesk/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@aqardesk/ui/components/sheet"
import { ListingForm } from "@/components/forms/listing-form"
import { useOverlayStore } from "@/components/overlays/overlay-store"
import { useScopedI18n } from "@/locales/client"

export function CreateListingSheet() {
  const t = useScopedI18n("listings")
  const common = useScopedI18n("common")
  const open = useOverlayStore((state) => state.createListingOpen)
  const setOpen = useOverlayStore((state) => state.setCreateListingOpen)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="sm:max-w-xl"
        closeLabel={common("close")}
      >
        <SheetHeader>
          <SheetTitle>{t("createTitle")}</SheetTitle>
          <SheetDescription>{t("createDescription")}</SheetDescription>
        </SheetHeader>
        <ListingForm onCreated={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

export function CreateListingButton() {
  const t = useScopedI18n("listings")
  const setOpen = useOverlayStore((state) => state.setCreateListingOpen)

  return <Button onClick={() => setOpen(true)}>{t("createNew")}</Button>
}
