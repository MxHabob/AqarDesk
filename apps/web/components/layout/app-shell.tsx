import type { ReactNode } from "react"

import { AppHeader } from "./app-header"
import { AppSidebar } from "./app-sidebar"

export function AppShell({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-svh">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <AppHeader />
        <main className="mx-auto w-full max-w-screen-2xl p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
