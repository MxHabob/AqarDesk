"use client"

import { authClient } from "@aqardesk/auth/client"
import { Button } from "@aqardesk/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useCurrentLocale, useI18n } from "@/locales/client"

export function SignOut() {
  const locale = useCurrentLocale()
  const t = useI18n()
  const router = useRouter()
  const [error, setError] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function signOut() {
    setError(false)
    setIsSigningOut(true)

    try {
      const result = await authClient.signOut()
      if (result.error) {
        setError(true)
        return
      }

      router.replace(`/${locale}/login`)
      router.refresh()
    } catch {
      setError(true)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case tracking-normal">
          {t("accountSettings.signOutTitle")}
        </CardTitle>
        <CardDescription>
          {t("accountSettings.signOutDescription")}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {t("auth.signOutError")}
          </p>
        ) : (
          <div />
        )}
        <Button
          className="w-full sm:w-auto"
          disabled={isSigningOut}
          onClick={signOut}
          type="button"
          variant="outline"
        >
          {isSigningOut ? t("auth.signingOut") : t("auth.signOut")}
        </Button>
      </CardFooter>
    </Card>
  )
}
