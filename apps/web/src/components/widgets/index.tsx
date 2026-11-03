"use client"

import { Suspense } from "react"
import { SummarySkeleton, WidgetCardsSkeleton } from "./overview-skeleton"
import { WelcomeGreeting, WelcomeSummary } from "./welcome-section"
import { WidgetCards } from "./widget-cards"

export function OverviewView() {
  return (
    <div className="mt-2 pb-16 flex flex-col justify-center min-h-[calc(100vh-120px)] max-w-3xl mx-auto w-full">
      <div className="flex flex-col items-center text-center pt-6 pb-10 w-full">
        <WelcomeGreeting />
        <Suspense fallback={<SummarySkeleton />}>
          <WelcomeSummary />
        </Suspense>
      </div>
      <Suspense fallback={<WidgetCardsSkeleton />}>
        <WidgetCards />
      </Suspense>
    </div>
  )
}
