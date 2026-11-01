import { Button } from "@aqardesk/ui/components/button"
import Link from "next/link"
import { useScopedI18n } from "@/locales/client"

export function AppHeader() {
  const t = useScopedI18n("common")

  return (
    <header className="flex min-h-16 items-center justify-between border-b px-5 md:px-8">
      <div className="font-semibold">AqarDesk</div>
      <Button
        variant="outline"
        size="sm"
        render={<Link href="/listings/new" />}
      >
        {t("addListing")}
      </Button>
    </header>
  )
}
