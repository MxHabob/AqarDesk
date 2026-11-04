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
import { useI18n } from "@/locales/client"

export function EmailOtpSignIn({ callbackURL }: { callbackURL: string }) {
  const router = useRouter()
  const t = useI18n()
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"email" | "code">("email")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  async function sendCode() {
    setError(false)
    setIsLoading(true)

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      })

      if (result.error) {
        setError(true)
        return
      }

      setStep("code")
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
      const result = await authClient.signIn.emailOtp({ email, otp: code })

      if (result.error) {
        setError(true)
        return
      }

      router.replace(callbackURL)
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (step === "email") {
    return (
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          void sendCode()
        }}
      >
        <label htmlFor="login-email" className="sr-only">
          {t("auth.email")}
        </label>
        <Input
          id="login-email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          type="email"
          placeholder={t("auth.email")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
          required
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {t("auth.emailOtpError")}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("auth.sendingEmailOtp") : t("auth.continueWithEmail")}
        </Button>
      </form>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-center text-sm text-muted-foreground">
        {t("auth.emailOtpInstructions")} <span dir="ltr">{email}</span>
      </p>
      <InputOTP
        maxLength={6}
        autoFocus
        disabled={isLoading}
        onComplete={(code) => void verifyCode(code)}
        render={({ slots }) => (
          <InputOTPGroup dir="ltr" className="mx-auto gap-2">
            {slots.map((slot, index) => (
              <InputOTPSlot
                key={slot.char || `otp-slot-${index}`}
                index={index}
              />
            ))}
          </InputOTPGroup>
        )}
      />
      {isLoading && (
        <p className="text-center text-sm text-muted-foreground">
          {t("auth.verifying")}
        </p>
      )}
      {error && (
        <p role="alert" className="text-center text-sm text-destructive">
          {t("auth.emailOtpError")}
        </p>
      )}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>{t("auth.wrongEmail")}</span>
        <button
          type="button"
          className="underline underline-offset-4 transition-colors hover:text-foreground"
          onClick={() => {
            setError(false)
            setStep("email")
          }}
          disabled={isLoading}
        >
          {t("auth.changeEmail")}
        </button>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => void sendCode()}
        disabled={isLoading}
      >
        {t("auth.resendEmailOtp")}
      </Button>
    </div>
  )
}
