"use client"

import { create } from "zustand"

export interface ConfirmationRequest {
  onConfirm: () => void | Promise<void>
}

interface OverlayState {
  createListingOpen: boolean
  confirmation: ConfirmationRequest | null
  setCreateListingOpen: (open: boolean) => void
  requestConfirmation: (request: ConfirmationRequest) => void
  closeConfirmation: () => void
}

export const useOverlayStore = create<OverlayState>()((set) => ({
  createListingOpen: false,
  confirmation: null,
  setCreateListingOpen: (createListingOpen) => set({ createListingOpen }),
  requestConfirmation: (confirmation) => set({ confirmation }),
  closeConfirmation: () => set({ confirmation: null }),
}))
