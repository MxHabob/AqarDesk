"use client"

import { useEffect } from "react"

export function DashboardScrollbar() {
  useEffect(() => {
    document.documentElement.classList.add("dashboard-no-scrollbars")

    return () => {
      document.documentElement.classList.remove("dashboard-no-scrollbars")
    }
  }, [])

  return null
}
