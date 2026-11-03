"use client"

import { type ReactNode, useEffect } from "react"

export function ListingsPageViewport({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add("public-listings-page")

    return () => {
      root.classList.remove("public-listings-page")
    }
  }, [])

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 py-6 sm:space-y-8 sm:py-10">
      {children}
    </div>
  )
}
