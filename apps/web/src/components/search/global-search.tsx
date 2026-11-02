"use client"

import { Button } from "@aqardesk/ui/components/button"
import { Dialog, DialogContent } from "@aqardesk/ui/components/dialog"
import { Input } from "@aqardesk/ui/components/input"
import { useQuery } from "@tanstack/react-query"
import { Search, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { searchListingsAction } from "@/actions/listings/search-listings"
import { useScopedI18n } from "@/locales/client"
import { useSearchStore } from "./search-store"

export function GlobalSearch() {
  const open = useSearchStore((state) => state.open)
  const setOpen = useSearchStore((state) => state.setOpen)
  const t = useScopedI18n("common")
  const router = useRouter()
  const [query, setQuery] = useState("")

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen(!open)
      }
      if (event.key === "Escape") setOpen(false)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, setOpen])

  const results = useQuery({
    queryKey: ["global-search", query],
    enabled: open && query.trim().length > 1,
    staleTime: 20_000,
    queryFn: async () => {
      const response = await searchListingsAction({
        query: query.trim(),
        propertyType: null,
        listingType: null,
        status: null,
        page: 1,
        pageSize: 10,
      })
      if (!response?.data) {
        throw new Error(response?.serverError ?? t("searchEmpty"))
      }
      return response.data.rows.slice(0, 8)
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setQuery("")
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="top-[20%] max-w-2xl translate-y-0 overflow-hidden p-0"
      >
        <div className="flex items-center gap-3 border-b px-4">
          <Search aria-hidden="true" className="size-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="h-14 border-0 shadow-none focus-visible:ring-0"
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="max-h-[min(60vh,28rem)] overflow-y-auto p-2">
          {query.trim().length > 1 && results.isPending && (
            <p className="p-4 text-sm text-muted-foreground">{t("loading")}</p>
          )}
          {results.isError && (
            <p role="alert" className="p-4 text-sm text-destructive">
              {t("searchError")}
            </p>
          )}
          {results.data?.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              {t("searchEmpty")}
            </p>
          )}
          {results.data?.map((row) => (
            <button
              key={row.id}
              type="button"
              className="flex w-full items-center justify-between gap-3 px-3 py-3 text-start text-sm hover:bg-muted"
              onClick={() => {
                setOpen(false)
                router.push(
                  `/listings?q=${encodeURIComponent(row.title)}`
                )
              }}
            >
              <span className="truncate font-medium">{row.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {row.city ?? ""}
              </span>
            </button>
          ))}
          <p className="border-t px-3 py-2 text-xs text-muted-foreground">
            {t("searchHint")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
