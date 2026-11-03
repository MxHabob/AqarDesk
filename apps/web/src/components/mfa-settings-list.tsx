"use client"

import { authClient } from "@aqardesk/auth/client"
import { Button } from "@aqardesk/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/components/card"
import { Input } from "@aqardesk/ui/components/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useCurrentLocale, useI18n } from "@/locales/client"

export function MfaSettingsList({ enabled }: { enabled: boolean }) {
  const locale = useCurrentLocale()
  const router = useRouter()
  const t = useI18n()
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  async function disableMfa() {
    setError(false)
    setIsLoading(true)

    try {
      const { error: disableError } = await authClient.twoFactor.disable({
        ...(password ? { password } : {}),
      })

      if (disableError) {
        setError(true)
        return
      }

      setPassword("")
      router.refresh()
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case tracking-normal">
          {t("auth.twoFactorTitle")}
        </CardTitle>
        <CardDescription>{t("auth.mfaSettingsDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">
          {enabled ? t("auth.mfaEnabled") : t("auth.mfaDisabled")}
        </p>
        {enabled && (
          <label htmlFor="disable-mfa-password" className="block space-y-2">
            <span className="text-sm">{t("auth.currentPassword")}</span>
            <Input
              id="disable-mfa-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
            />
          </label>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {t("auth.mfaError")}
          </p>
        )}
      </CardContent>
      <CardFooter className="justify-end">
        {enabled ? (
          <Button
            type="button"
            variant="destructive"
            onClick={disableMfa}
            disabled={isLoading}
          >
            {isLoading ? t("auth.disablingMfa") : t("auth.disableMfa")}
          </Button>
        ) : (
          <Button render={<Link href={`/${locale}/dashboard/mfa/setup`} />}>
            {t("auth.enableMfa")}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
