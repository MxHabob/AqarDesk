"use client"

import { Button } from "@aqardesk/ui/components/button"
import { Icons } from "@aqardesk/ui/components/icons"
import { useSearchStore } from "@/store/search"

export function OpenSearchButton() {
  const { setOpen } = useSearchStore()

  return (
    <Button
      variant="outline"
      data-track="Search Opened"
      className="relative min-w-[250px] w-full justify-start text-sm text-muted-foreground sm:pe-12 md:w-40 lg:w-64 border-0 p-0 hover:bg-transparent font-normal no-drag hidden md:flex"
      onClick={() => setOpen(true)}
    >
      <Icons.Search size={18} className="me-2" />
      <span>ابحث في النظام...</span>
      <kbd className="pointer-events-none absolute opacity-0 hover:opacity-100 end-1.5 top-1.5 hidden h-5 select-none items-center gap-1 border bg-accent px-1.5 text-[10px] font-medium sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}
