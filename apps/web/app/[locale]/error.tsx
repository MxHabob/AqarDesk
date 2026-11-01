"use client"

import { useEffect } from "react"

import { Button } from "@aqardesk/ui/components/button"
import { useScopedI18n } from "@/locales/client"

export default function LocaleError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  const t = useScopedI18n("errors")
  const common = useScopedI18n("common")

  useEffect(() => {
    console.error("Route error", error)
  }, [error])

  return (
    <main className="flex min-h-svh items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            {t("digest").replace("{digest}", error.digest)}
          </p>
        )}
        <Button onClick={() => retry()}>{common("retry")}</Button>
      </div>
    </main>
  )
}
