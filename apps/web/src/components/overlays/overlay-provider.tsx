"use client"

import { ConfirmModal } from "@/components/modals/confirm-modal"
import { CreateListingSheet } from "@/components/sheets/create-listing-sheet"

export function OverlayProvider() {
  return (
    <>
      <CreateListingSheet />
      <ConfirmModal />
    </>
  )
}
