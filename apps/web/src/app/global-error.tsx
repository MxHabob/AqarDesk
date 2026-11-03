"use client"

import { Button } from "@aqardesk/ui/components/button"
import "@aqardesk/ui/globals.css"

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="en">
      <body className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground antialiased">
        <main className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
          <Button onClick={() => retry()}>Try again</Button>
        </main>
      </body>
    </html>
  )
}
