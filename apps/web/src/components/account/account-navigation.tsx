"use client"

import { authClient } from "@aqardesk/auth/client"
import { Button } from "@aqardesk/ui/components/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function AccountNavigation({ locale }: { locale: string }) {
  const isArabic = locale === "ar"
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
      <nav aria-label={isArabic ? "إدارة الحساب" : "Account navigation"}>
        <ul className="flex flex-wrap gap-4 text-sm">
          <li>
            <Link href={`/${locale}/account`}>
              {isArabic ? "حسابي" : "My account"}
            </Link>
          </li>
          <li>
            <Link href={`/${locale}/account/favorites`}>
              {isArabic ? "عقاراتي المفضلة" : "Saved properties"}
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
        {isSigningOut
          ? isArabic
            ? "جارٍ الخروج..."
            : "Signing out..."
          : isArabic
            ? "تسجيل الخروج"
            : "Sign out"}
      </Button>
      {error && (
        <p role="alert" className="w-full text-sm text-destructive">
          {isArabic
            ? "تعذر تسجيل الخروج. حاول مرة أخرى."
            : "Unable to sign out. Please try again."}
        </p>
      )}
    </div>
  )
}
