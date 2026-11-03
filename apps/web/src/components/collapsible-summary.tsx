"use client"

import { cn } from "@aqardesk/ui/cn"
import type { ReactNode } from "react"

interface CollapsibleSummaryProps {
  children: ReactNode
  className?: string
}

/**
 * Wrapper component for summary grids that collapses with the header on scroll.
 * Uses the same CSS variable (--header-offset) as the Header and MainContent
 * to create a unified collapsing effect.
 */
export function CollapsibleSummary({
  children,
  className,
}: CollapsibleSummaryProps) {
  return (
    <div
      className={cn("transition-transform", className)}
      style={{
        transform: "translateY(calc(var(--header-offset, 0px) * -1))",
        transitionDuration: "var(--header-transition, 200ms)",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  )
}
