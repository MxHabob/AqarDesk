"use client"

import { create } from "zustand"

interface SidebarState {
  mobileOpen: boolean
  setMobileOpen: (mobileOpen: boolean) => void
  toggleMobile: () => void
}

export const useSidebarStore = create<SidebarState>()((set) => ({
  mobileOpen: false,
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
  toggleMobile: () => set((state) => ({ mobileOpen: !state.mobileOpen })),
}))
