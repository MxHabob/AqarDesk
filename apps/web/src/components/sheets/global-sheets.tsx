"use client"

import {
  ListingSheet,
  OwnerSheet,
  PropertySheet,
} from "@/components/sheets/real-estate-sheets"

export function GlobalSheets() {
  return (
    <>
      <PropertySheet />
      <ListingSheet />
      <OwnerSheet />
    </>
  )
}
