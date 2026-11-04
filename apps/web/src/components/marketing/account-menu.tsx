"use client"

import { authClient } from "@aqardesk/auth/client"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@aqardesk/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@aqardesk/ui/components/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useCurrentLocale, useI18n } from "@/locales/client"

type Props = {
  user: {
    name: string
    email: string
    image: string | null
  }
  roleDestination: string | null
  onNavigate?: () => void
}

export function MarketingAccountMenu({
  user,
  roleDestination,
  onNavigate,
}: Props) {
  const locale = useCurrentLocale()
  const router = useRouter()
  const t = useI18n()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState(false)
  const isEmployee = roleDestination === `/${locale}/dashboard`
  const initial = user.name.trim().charAt(0) || user.email.charAt(0)

  async function signOut() {
    setSignOutError(false)
    setIsSigningOut(true)

    try {
      const result = await authClient.signOut()

      if (result.error) {
        setSignOutError(true)
        return
      }

      router.replace(`/${locale}`)
      router.refresh()
    } catch {
      setSignOutError(true)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex rounded-full border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t("auth.userMenu")}
      >
        <Avatar>
          {user.image && <AvatarImage src={user.image} alt="" />}
          <AvatarFallback>{initial.toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" sideOffset={10}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="normal-case tracking-normal">
            <span className="block truncate text-xs">{user.name}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {isEmployee && roleDestination && (
            <Link href={roleDestination} onClick={onNavigate}>
              <DropdownMenuItem className="normal-case tracking-normal">
                {t("auth.openDashboard")}
              </DropdownMenuItem>
            </Link>
          )}
          {roleDestination && (
            <>
              <Link href={`/${locale}/account`} onClick={onNavigate}>
                <DropdownMenuItem className="normal-case tracking-normal">
                  {t("auth.myAccount")}
                </DropdownMenuItem>
              </Link>
              <Link href={`/${locale}/account/favorites`} onClick={onNavigate}>
                <DropdownMenuItem className="normal-case tracking-normal">
                  {t("auth.savedProperties")}
                </DropdownMenuItem>
              </Link>
              <Link href={`/${locale}/account/support`} onClick={onNavigate}>
                <DropdownMenuItem className="normal-case tracking-normal">
                  {t("accountSettings.support")}
                </DropdownMenuItem>
              </Link>
            </>
          )}

          {(roleDestination || signOutError) && <DropdownMenuSeparator />}
          {signOutError && (
            <DropdownMenuLabel className="whitespace-normal text-destructive">
              {t("auth.signOutError")}
            </DropdownMenuLabel>
          )}
          <DropdownMenuItem
            className="normal-case tracking-normal"
            disabled={isSigningOut}
            onClick={() => void signOut()}
          >
            {isSigningOut ? t("auth.signingOut") : t("auth.signOut")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
