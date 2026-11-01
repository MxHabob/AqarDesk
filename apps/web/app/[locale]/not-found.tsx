import Link from "next/link"

import { Button } from "@aqardesk/ui/components/button"
import { getScopedI18n } from "@/locales/server"

export default async function NotFound() {
  const [t, common] = await Promise.all([
    getScopedI18n("errors"),
    getScopedI18n("common"),
  ])

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">{t("notFound")}</h1>
      <Button render={<Link href="/" />}>{common("backToHome")}</Button>
    </main>
  )
}
