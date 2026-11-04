"use client"

import { authClient } from "@aqardesk/auth/client"
import { Button } from "@aqardesk/ui/components/button"
import { Icons } from "@aqardesk/ui/components/icons"
import { useState } from "react"
import { useI18n } from "@/locales/client"

export function OAuthSignIn({
  enabled,
  callbackURL,
}: {
  enabled: boolean
  callbackURL: string
}) {
  const t = useI18n()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  if (!enabled) return null

  async function handleSignIn() {
    setError(false)
    setIsLoading(true)

    try {
      const { error: signInError } = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      })

      if (signInError) {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        dir="ltr"
        className="w-full"
        disabled={isLoading}
        onClick={handleSignIn}
      >
        <Icons.Google size={16} />
        {isLoading ? t("auth.loggingIn") : t("auth.googleSignIn")}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {t("auth.loginError")}
        </p>
      )}
    </div>
  )
}
