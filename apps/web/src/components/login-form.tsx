"use client"

import { EmailOtpSignIn } from "@/components/email-otp-sign-in"
import { LoginAccordion } from "@/components/login-accordion"
import { OAuthSignIn } from "@/components/oauth-sign-in"
import { useI18n } from "@/locales/client"

export function LoginForm({
  googleEnabled,
  emailOtpEnabled,
}: {
  googleEnabled: boolean
  emailOtpEnabled: boolean
}) {
  const t = useI18n()

  return (
    <div className="w-full space-y-3">
      {googleEnabled && <OAuthSignIn enabled={googleEnabled} />}

      {googleEnabled && emailOtpEnabled && (
        <>
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 font-sans text-muted-foreground">
                {t("auth.or")}
              </span>
            </div>
          </div>
          <LoginAccordion>
            <EmailOtpSignIn />
          </LoginAccordion>
        </>
      )}

      {!googleEnabled && emailOtpEnabled && <EmailOtpSignIn />}

      {!googleEnabled && !emailOtpEnabled && (
        <p role="alert" className="text-center text-sm text-destructive">
          {t("auth.noSignInMethods")}
        </p>
      )}
    </div>
  )
}
