"use client"

import { create } from "zustand"

interface ListingFiltersState {
  query: string
  listingType: "sale" | "rent" | null
  propertyType: string | null
  setQuery: (query: string) => void
  setListingType: (listingType: ListingFiltersState["listingType"]) => void
  setPropertyType: (propertyType: string | null) => void
  reset: () => void
}

const initialState = {
  query: "",
  listingType: null,
  propertyType: null,
}

export const useListingFilters = create<ListingFiltersState>()((set) => ({
  ...initialState,
  setQuery: (query) => set({ query }),
  setListingType: (listingType) => set({ listingType }),
  setPropertyType: (propertyType) => set({ propertyType }),
  reset: () => set(initialState),
}))
