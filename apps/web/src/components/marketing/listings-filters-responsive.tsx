"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@aqardesk/ui/components/sheet"
import { SlidersHorizontal } from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"

type Props = {
  children: ReactNode
  title: string
  closeLabel: string
  resultCount: number
  resultLabel: string
}

export function ListingsFiltersResponsive({
  children,
  title,
  closeLabel,
  resultCount,
  resultLabel,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="inline-flex h-10 items-center gap-2 border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
            <SlidersHorizontal aria-hidden className="size-4" />
            {title}
          </SheetTrigger>
          <SheetContent
            side="bottom"
            closeLabel={closeLabel}
            className="max-h-[90dvh]"
            panelClassName="max-h-[90dvh] overscroll-contain p-4"
            onClick={(event) => {
              if (
                event.target instanceof Element &&
                event.target.closest("[data-clear-listing-filters]")
              ) {
                setOpen(false)
              }
            }}
          >
            <SheetHeader className="border-b border-border pb-3 text-start">
              <SheetTitle>{title}</SheetTitle>
            </SheetHeader>
            {children}
          </SheetContent>
        </Sheet>
        <p className="text-sm font-medium text-muted-foreground">
          {resultCount} {resultLabel}
        </p>
      </div>

      <aside className="hidden min-w-0 self-start lg:sticky lg:top-32 lg:block">
        {children}
      </aside>
    </>
  )
}
