"use client"

import { Button } from "@aqardesk/ui/components/button"
import "@aqardesk/ui/globals.css"
import { usePathname } from "next/navigation"
import ar from "@/locales/ar"
import en from "@/locales/en"

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  const pathname = usePathname()
  const isEnglish = pathname?.split("/")[1] === "en"
  const translations = isEnglish ? en : ar

  return (
    <html lang={isEnglish ? "en" : "ar"} dir={isEnglish ? "ltr" : "rtl"}>
      <body className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground antialiased">
        <main className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-xl font-semibold">
            {translations.errors.globalTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {translations.errors.globalDescription}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              {translations.errors.digest.replace("{digest}", error.digest)}
            </p>
          )}
          <Button onClick={() => retry()}>{translations.common.retry}</Button>
        </main>
      </body>
    </html>
  )
}
