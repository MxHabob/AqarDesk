"use client"

import { type ReactNode, useEffect, useRef } from "react"

type Props = {
  children: ReactNode
  page: number
}

export function ListingsResultsScroller({ children, page }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const previousPageRef = useRef(page)

  useEffect(() => {
    if (previousPageRef.current === page) return
    previousPageRef.current = page
    scrollerRef.current?.scrollIntoView({ block: "start" })
  }, [page])

  return (
    <div
      ref={scrollerRef}
      id="listings-results"
      className="min-w-0 space-y-6 sm:space-y-8"
    >
      {children}
    </div>
  )
}
