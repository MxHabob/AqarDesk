"use client"

import { Dialog, DialogContent } from "@aqardesk/ui/components/dialog"
import { useHotkeys } from "react-hotkeys-hook"
import { useSearchStore } from "@/store/search"
import { Search } from "./search"
import { SearchFooter } from "./search-footer"

export function SearchModal() {
  const { isOpen, setOpen } = useSearchStore()

  useHotkeys("meta+k, ctrl+k", () => setOpen(), {
    enableOnFormTags: true,
  })

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent
        className="m-0 flex h-[535px] w-full max-w-full flex-col gap-0 overflow-hidden border-none bg-transparent p-0 select-text md:max-w-[740px]"
        showCloseButton={false}
      >
        {isOpen && (
          <>
            <Search />
            <SearchFooter />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
