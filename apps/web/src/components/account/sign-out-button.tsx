"use client"

import { authClient } from "@aqardesk/auth/client"
import { Button } from "@aqardesk/ui/components/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useScopedI18n } from "@/locales/client"

export function SignOutButton() {
  const t = useScopedI18n("account")
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [hasError, setHasError] = useState(false)

  async function handleSignOut() {
    setIsPending(true)
    setHasError(false)

    try {
      const result = await authClient.signOut()

      if (result.error) {
        setHasError(true)
        return
      }

      router.replace("/")
      router.refresh()
    } catch {
      setHasError(true)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={handleSignOut}
      >
        {isPending ? t("signingOut") : t("signOut")}
      </Button>
      {hasError && (
        <p role="alert" className="text-sm text-destructive">
          {t("signOutError")}
        </p>
      )}
    </div>
  )
}
