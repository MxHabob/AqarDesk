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
}

export function ListingsFiltersResponsive({
  children,
  title,
  closeLabel,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="mb-1 flex items-center justify-start gap-3 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
            <SlidersHorizontal aria-hidden className="size-4" />
            {title}
          </SheetTrigger>
          <SheetContent
            side="bottom"
            closeLabel={closeLabel}
            className="max-h-[92dvh] rounded-t-lg"
            panelClassName="max-h-[92dvh] overscroll-contain p-4 sm:p-6"
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
      </div>

      <aside className="scrollbar-hide hidden min-w-0 self-start lg:sticky lg:top-28 lg:block lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:overscroll-contain lg:rounded-lg lg:border lg:border-border lg:bg-card lg:p-5">
        {children}
      </aside>
    </>
  )
}
