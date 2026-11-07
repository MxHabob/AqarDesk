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
    <div className="mx-auto w-full max-w-[1680px] space-y-6 pb-12 pt-20 sm:space-y-8 sm:pt-24">
      {children}
    </div>
  )
}
