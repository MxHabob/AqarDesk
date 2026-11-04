"use client"

import { Suspense } from "react"
import { SummarySkeleton, WidgetCardsSkeleton } from "./overview-skeleton"
import { WelcomeGreeting, WelcomeSummary } from "./welcome-section"
import { WidgetCards } from "./widget-cards"

export function OverviewView() {
  return (
    <div className="mx-auto mt-2 flex min-h-[calc(100vh-120px)] w-full max-w-5xl flex-col justify-center pb-16">
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
