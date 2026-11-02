"use client"

import { authClient } from "@aqardesk/auth/client"
import { Button } from "@aqardesk/ui/components/button"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { getFavoriteStatusAction } from "@/actions/favorites/get-favorite-status"
import { toggleFavoriteAction } from "@/actions/favorites/toggle-favorite"
import { useScopedI18n } from "@/locales/client"

export function FavoriteToggleButton({
  listingId,
  initialFavorite = false,
}: {
  listingId: string
  initialFavorite?: boolean
}) {
  const t = useScopedI18n("publicListings")
  const router = useRouter()
  const queryClient = useQueryClient()
  const session = authClient.useSession()
  const queryKey = ["favorite-status", listingId]
  const favorite = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await getFavoriteStatusAction({ listingId })
      if (!response?.data) {
        throw new Error(response?.serverError ?? t("favoriteError"))
      }
      return response.data.isFavorite
    },
    enabled: Boolean(session.data?.user),
    initialData: initialFavorite,
    refetchOnMount: "always",
  })
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await toggleFavoriteAction({ listingId })
      if (!response?.data) {
        throw new Error(response?.serverError ?? t("favoriteError"))
      }
      return response.data.isFavorite
    },
    onSuccess: (isFavorite) => {
      queryClient.setQueryData(queryKey, isFavorite)
      router.refresh()
    },
  })
  const isFavorite = favorite.data ?? initialFavorite

  function handleClick() {
    if (!session.data?.user) {
      router.push(
        `/account/login?return_to=${encodeURIComponent(`/p/${listingId}`)}`
      )
      return
    }

    mutation.mutate()
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        aria-label={isFavorite ? t("unfavorite") : t("favorite")}
        aria-pressed={isFavorite}
        disabled={session.isPending || mutation.isPending}
        onClick={handleClick}
      >
        <Heart
          aria-hidden="true"
          className="size-4"
          fill={isFavorite ? "currentColor" : "none"}
        />
        {isFavorite ? t("unfavorite") : t("favorite")}
      </Button>
      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {t("favoriteError")}
        </p>
      )}
      {favorite.isError && (
        <p role="alert" className="text-sm text-destructive">
          {t("favoriteError")}
        </p>
      )}
    </div>
  )
}
