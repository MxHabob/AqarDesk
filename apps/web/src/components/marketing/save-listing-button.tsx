"use client"

import { Button } from "@aqardesk/ui/components/button"
import { Heart } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toggleFavoriteAction } from "@/actions/favorites/toggle-favorite"
import { useFavorites } from "@/components/marketing/favorites-provider"
import { useScopedI18n } from "@/locales/client"

export function SaveListingButton({ listingId }: { listingId: string }) {
  const { isAuthenticated, isFavorite, requestSignIn, setFavorite } =
    useFavorites()
  const t = useScopedI18n("publicListings")
  const [hasError, setHasError] = useState(false)
  const favorite = isFavorite(listingId)
  const toggleFavorite = useAction(toggleFavoriteAction, {
    onSuccess: ({ data }) => {
      setFavorite(listingId, data.isFavorite)
    },
    onError: () => setHasError(true),
  })

  function handleClick() {
    setHasError(false)
    if (!isAuthenticated) {
      requestSignIn()
      return
    }

    toggleFavorite.execute({ listingId })
  }

  return (
    <div className="relative shrink-0">
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={favorite ? t("unfavorite") : t("favorite")}
        aria-pressed={favorite}
        className="gap-1.5 border-border bg-background/95 shadow-sm hover:bg-background"
        disabled={toggleFavorite.isExecuting}
        onClick={handleClick}
      >
        <Heart
          aria-hidden
          className={favorite ? "size-4 fill-current text-primary" : "size-4"}
        />
        {favorite ? t("unfavorite") : t("favorite")}
      </Button>
      {hasError && (
        <p
          role="alert"
          className="absolute end-0 top-full mt-1 w-48 bg-background p-2 text-xs text-destructive shadow-sm"
        >
          {t("favoriteError")}
        </p>
      )}
    </div>
  )
}
