import "server-only"

import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { cache } from "react"
import type { ReactNode } from "react"
import { makeQueryClient } from "./query-client"

export const getQueryClient = cache(makeQueryClient)

export function HydrateClient({ children }: { children: ReactNode }) {
  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      {children}
    </HydrationBoundary>
  )
}
