import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "AqarDesk Dashboard",
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
