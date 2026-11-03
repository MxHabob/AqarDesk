"use client"

import { authClient } from "@aqardesk/auth/client"
import { Button } from "@aqardesk/ui/components/button"
import { Input } from "@aqardesk/ui/components/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@aqardesk/ui/components/input-otp"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useCurrentLocale, useI18n } from "@/locales/client"

export function VerifyMfa({
  emailOtpAvailable = false,
}: {
  emailOtpAvailable?: boolean
}) {
  const locale = useCurrentLocale()
  const router = useRouter()
  const t = useI18n()
  const [backupCode, setBackupCode] = useState("")
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [useEmailOtp, setUseEmailOtp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  async function verify(code: string, method: "totp" | "otp" | "backup") {
    setError(false)
    setIsLoading(true)

    try {
      const result =
        method === "totp"
          ? await authClient.twoFactor.verifyTotp({ code })
          : method === "otp"
            ? await authClient.twoFactor.verifyOtp({ code })
            : await authClient.twoFactor.verifyBackupCode({ code })

      if (result.error) {
        setError(true)
        return
      }

      router.replace(`/${locale}/login/callback`)
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  async function sendEmailOtp() {
    setError(false)
    setIsLoading(true)

    try {
      const result = await authClient.twoFactor.sendOtp()

      if (result.error) {
        setError(true)
        return
      }

      setUseEmailOtp(true)
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="w-full space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-xl font-semibold">{t("auth.twoFactorTitle")}</h1>
        <p className="text-sm text-muted-foreground">
          {useEmailOtp
            ? t("auth.twoFactorEmailDescription")
            : t("auth.twoFactorDescription")}
        </p>
      </header>

      {useBackupCode ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            void verify(backupCode, "backup")
          }}
        >
          <label htmlFor="backup-code" className="block space-y-2 text-sm">
            <span>{t("auth.backupCode")}</span>
            <Input
              id="backup-code"
              autoComplete="one-time-code"
              value={backupCode}
              onChange={(event) => setBackupCode(event.target.value)}
              disabled={isLoading}
              required
            />
          </label>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("auth.verifying") : t("auth.verifyCode")}
          </Button>
        </form>
      ) : (
        <InputOTP
          maxLength={6}
          autoFocus
          disabled={isLoading}
          onComplete={(code) => void verify(code, useEmailOtp ? "otp" : "totp")}
          render={({ slots }) => (
            <InputOTPGroup className="mx-auto">
              {slots.map((_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          )}
        />
      )}

      {emailOtpAvailable && !useBackupCode && (
        <div className="space-y-3">
          {useEmailOtp && (
            <p className="text-center text-sm text-muted-foreground">
              {t("auth.emailOtpSent")}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              if (useEmailOtp) {
                setError(false)
                setUseEmailOtp(false)
              } else {
                void sendEmailOtp()
              }
            }}
            disabled={isLoading}
          >
            {useEmailOtp
              ? t("auth.useAuthenticatorCode")
              : t("auth.sendEmailOtp")}
          </Button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-center text-sm text-destructive">
          {t("auth.mfaError")}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => {
          setError(false)
          setUseBackupCode((current) => !current)
        }}
        disabled={isLoading}
      >
        {useBackupCode
          ? t("auth.useAuthenticatorCode")
          : t("auth.useBackupCode")}
      </Button>
    </section>
  )
}
