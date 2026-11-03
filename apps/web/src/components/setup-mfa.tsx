"use client"

import { Button } from "@aqardesk/ui/components/button"
import Link from "next/link"
import { useState } from "react"
import { useCurrentLocale, useI18n } from "@/locales/client"
import { EnrollMFA } from "@/components/enroll-mfa"

export function SetupMfa() {
  const [enroll, setEnroll] = useState(false)
  const locale = useCurrentLocale()
  const t = useI18n()

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-xl font-semibold">{t("auth.twoFactorTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("auth.mfaSetupDescription")}
          </p>
        </header>

        {enroll ? (
          <EnrollMFA />
        ) : (
          <div className="space-y-4">
            <Button className="w-full" onClick={() => setEnroll(true)}>
              {t("auth.generateCode")}
            </Button>
            <Link
              href={`/${locale}/dashboard/account/security`}
              className="block text-center text-sm text-muted-foreground underline"
            >
              {t("common.cancel")}
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
