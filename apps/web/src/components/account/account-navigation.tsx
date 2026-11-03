"use client"

import { authClient } from "@aqardesk/auth/client"
import { Button } from "@aqardesk/ui/components/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useScopedI18n } from "@/locales/client"

export function AccountNavigation({ locale }: { locale: string }) {
  const t = useScopedI18n("account")
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
    <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
      <nav aria-label={t("navigationLabel")}>
        <ul className="flex flex-wrap gap-4 text-sm">
          <li>
            <Link href={`/${locale}/account`}>{t("title")}</Link>
          </li>
          <li>
            <Link href={`/${locale}/account/favorites`}>
              {t("favoritesTitle")}
            </Link>
          </li>
        </ul>
      </nav>
      <Button
        disabled={isSigningOut}
        onClick={signOut}
        type="button"
        variant="outline"
      >
        {isSigningOut ? t("signingOut") : t("signOut")}
      </Button>
      {error && (
        <p role="alert" className="w-full text-sm text-destructive">
          {t("signOutError")}
        </p>
      )}
    </div>
  )
}
