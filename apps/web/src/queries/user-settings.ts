import { queryOptions } from "@tanstack/react-query"
import { getCurrentUserSettingsAction } from "@/actions/user-settings"

export const userSettingsQueryKey = ["auth", "session"] as const

export const userSettingsQueryOptions = () =>
  queryOptions({
    queryKey: userSettingsQueryKey,
    queryFn: getCurrentUserSettingsAction,
    staleTime: 5 * 60 * 1000,
  })
