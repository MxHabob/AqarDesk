import { OpenSearchButton } from "@/components/search/open-search-button"
import { CreateListingButton } from "@/components/sheets/create-listing-sheet"
import { LanguageSwitcher } from "./language-switcher"

export function AppHeader() {
  return (
    <header className="flex min-h-16 items-center justify-between border-b px-5 md:px-8">
      <div className="font-semibold">AqarDesk</div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <OpenSearchButton />
        <CreateListingButton />
      </div>
    </header>
  )
}
