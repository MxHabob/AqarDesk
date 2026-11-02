"use client"

import { Button } from "@aqardesk/ui/components/button"
import { Search } from "lucide-react"
import { useScopedI18n } from "@/locales/client"
import { useSearchStore } from "./search-store"

export function OpenSearchButton() {
  const t = useScopedI18n("search")
  const setOpen = useSearchStore((state) => state.setOpen)

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 text-muted-foreground"
      aria-label={t("open")}
      onClick={() => setOpen(true)}
    >
      <Search aria-hidden="true" className="size-4" />
      <span className="hidden sm:inline">{t("open")}</span>
      <kbd className="hidden border px-1 text-[10px] sm:inline">⌘ K</kbd>
    </Button>
  )
}
