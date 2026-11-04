"use client"

import { authClient } from "@aqardesk/auth/client"
import { DropdownMenuItem } from "@aqardesk/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useCurrentLocale } from "@/locales/client"

export function SignOut() {
  const [isLoading, setLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const router = useRouter()
  const locale = useCurrentLocale()

  const handleSignOut = async () => {
    setLoading(true)
    setHasError(false)

    try {
      const result = await authClient.signOut()
      if (result.error) {
        setHasError(true)
        return
      }
      router.push(`/${locale}/login`)
      router.refresh()
    } catch {
      setHasError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenuItem
      className="text-xs normal-case tracking-normal"
      data-track="User Signed Out"
      disabled={isLoading}
      onClick={handleSignOut}
    >
      {hasError ? "Unable to sign out" : isLoading ? "Loading..." : "Sign out"}
    </DropdownMenuItem>
  )
}
