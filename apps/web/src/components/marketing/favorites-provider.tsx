"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@aqardesk/ui/components/dialog"
import Link from "next/link"
import { createContext, type ReactNode, useContext, useState } from "react"
import { LoginForm } from "@/components/login-form"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"

type FavoritesContextValue = {
  isAuthenticated: boolean
  isFavorite: (listingId: string) => boolean
  requestSignIn: () => void
  setFavorite: (listingId: string, isFavorite: boolean) => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({
  children,
  authenticated,
  favoriteListingIds,
  googleEnabled,
  emailOtpEnabled,
}: {
  children: ReactNode
  authenticated: boolean
  favoriteListingIds: string[]
  googleEnabled: boolean
  emailOtpEnabled: boolean
}) {
  const [favorites, setFavorites] = useState(() => new Set(favoriteListingIds))
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [returnTo, setReturnTo] = useState("")
  const locale = useCurrentLocale()
  const t = useScopedI18n("auth")
  const tListings = useScopedI18n("publicListings")
  const callbackURL = returnTo
    ? `/${locale}/login/callback?next=${encodeURIComponent(returnTo)}`
    : `/${locale}/login/callback`

  function requestSignIn() {
    setReturnTo(
      `${window.location.pathname}${window.location.search}${window.location.hash}`
    )
    setIsLoginOpen(true)
  }

  function setFavorite(listingId: string, isFavorite: boolean) {
    setFavorites((current) => {
      const next = new Set(current)
      if (isFavorite) next.add(listingId)
      else next.delete(listingId)
      return next
    })
  }

  return (
    <FavoritesContext.Provider
      value={{
        isAuthenticated: authenticated,
        isFavorite: (listingId) => favorites.has(listingId),
        requestSignIn,
        setFavorite,
      }}
    >
      {children}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent
          className="dark max-w-md gap-6 border border-border bg-background p-8 sm:max-w-md"
          closeLabel={tListings("close")}
        >
          <div
            className="space-y-2 text-center"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <DialogTitle className="font-serif text-lg font-normal tracking-normal normal-case">
              {t("customerLoginTitle")}
            </DialogTitle>
            <DialogDescription className="font-sans text-sm">
              {t("customerLoginDescription")}
            </DialogDescription>
          </div>
          <LoginForm
            callbackURL={callbackURL}
            emailOtpEnabled={emailOtpEnabled}
            googleEnabled={googleEnabled}
          />
          <p
            className="text-center font-sans text-xs text-muted-foreground"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {t("signInTerms")}{" "}
            <Link
              href={`/${locale}/terms`}
              className="underline transition-colors hover:text-foreground"
            >
              {t("termsOfService")}
            </Link>{" "}
            {t("and")}{" "}
            <Link
              href={`/${locale}/policy`}
              className="underline transition-colors hover:text-foreground"
            >
              {t("privacyPolicy")}
            </Link>
          </p>
        </DialogContent>
      </Dialog>
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)

  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider.")
  }

  return context
}
