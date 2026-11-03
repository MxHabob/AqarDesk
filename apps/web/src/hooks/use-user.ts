"use client"

import { useToast } from "@aqardesk/ui/use-toast"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { updateCurrentUserSettingsAction } from "@/actions/user-settings"
import {
  userSettingsQueryKey,
  userSettingsQueryOptions,
} from "@/queries/user-settings"

export function useUserQuery() {
  return useQuery(userSettingsQueryOptions())
}

export function useUserMutation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: updateCurrentUserSettingsAction,
    onSuccess: (user) => {
      queryClient.setQueryData(userSettingsQueryKey, user)
    },
    onError: (error) => {
      toast({ variant: "error", title: error.message })
    },
  })
}
