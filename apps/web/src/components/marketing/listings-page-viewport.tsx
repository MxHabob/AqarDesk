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
    <div className="mx-auto max-w-[1400px] space-y-6 pt-24 pb-6 sm:space-y-8 sm:pt-28 sm:pb-10">
      {children}
    </div>
  )
}
