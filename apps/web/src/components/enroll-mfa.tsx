"use client"

import { authClient } from "@aqardesk/auth/client"
import { Button } from "@aqardesk/ui/components/button"
import { Input } from "@aqardesk/ui/components/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@aqardesk/ui/components/input-otp"
import { QRCodeSVG } from "qrcode.react"
import { useState } from "react"
import { useI18n } from "@/locales/client"

export function EnrollMFA() {
  const t = useI18n()
  const [password, setPassword] = useState("")
  const [totpURI, setTotpURI] = useState("")
  const [secret, setSecret] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  async function generateCode() {
    setError(false)
    setIsLoading(true)

    try {
      const { data, error: enableError } = await authClient.twoFactor.enable({
        method: "totp",
        issuer: "AqarDesk",
        ...(password ? { password } : {}),
      })

      if (enableError || data.method !== "totp") {
        setError(true)
        return
      }

      const setupSecret = new URL(data.totpURI).searchParams.get("secret")
      if (!setupSecret) {
        setError(true)
        return
      }

      setTotpURI(data.totpURI)
      setSecret(setupSecret)
      setBackupCodes(data.backupCodes)
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  async function verifyCode(code: string) {
    setError(false)
    setIsLoading(true)

    try {
      const { error: verifyError } = await authClient.twoFactor.verifyTotp({
        code,
      })

      if (verifyError) {
        setError(true)
        return
      }

      setIsVerified(true)
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerified) {
    return (
      <div className="space-y-4">
        <p className="text-center font-medium">{t("auth.mfaEnabled")}</p>
        <div className="space-y-2 rounded-md border p-4">
          <h2 className="font-medium">{t("auth.backupCodesTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("auth.backupCodesWarning")}
          </p>
          <ul className="grid grid-cols-2 gap-2 font-mono text-sm">
            {backupCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {!totpURI ? (
        <div className="space-y-4">
          <label htmlFor="mfa-password" className="block space-y-2 text-sm">
            <span>{t("auth.currentPassword")}</span>
            <Input
              id="mfa-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
            />
          </label>
          <Button
            type="button"
            className="w-full"
            onClick={generateCode}
            disabled={isLoading}
          >
            {isLoading ? t("auth.generatingCode") : t("auth.generateCode")}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-center rounded-md bg-white p-4">
            <QRCodeSVG value={totpURI} size={220} />
          </div>
          <label htmlFor="mfa-secret" className="block space-y-2 text-sm">
            <span>{t("auth.setupKey")}</span>
            <Input id="mfa-secret" value={secret} readOnly />
          </label>
          <p className="text-sm text-muted-foreground">
            {t("auth.twoFactorDescription")}
          </p>
          <InputOTP
            maxLength={6}
            autoFocus
            disabled={isLoading}
            onComplete={verifyCode}
            render={({ slots }) => (
              <InputOTPGroup className="mx-auto">
                {slots.map((_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            )}
          />
        </>
      )}
      {error && (
        <p role="alert" className="text-center text-sm text-destructive">
          {t("auth.mfaError")}
        </p>
      )}
    </div>
  )
}
