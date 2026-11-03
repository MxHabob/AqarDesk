"use client"

import { SearchModal } from "@/components/search/search-modal"
import {
  ListingSheet,
  OwnerSheet,
  PropertySheet,
} from "@/components/sheets/real-estate-sheets"

export function GlobalSheets() {
  return (
    <>
      <SearchModal />
      <PropertySheet />
      <ListingSheet />
      <OwnerSheet />
    </>
  )
}
