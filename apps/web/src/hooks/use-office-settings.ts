"use client"

import { useToast } from "@aqardesk/ui/use-toast"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import {
  officeSettingsQueryKey,
  officeSettingsQueryOptions,
  updateOfficeSettingsAction,
} from "@/queries/office-settings"

export function useOfficeSettingsQuery() {
  return useSuspenseQuery(officeSettingsQueryOptions())
}

export function useOfficeSettingsMutation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: updateOfficeSettingsAction,
    onSuccess: (settings) => {
      queryClient.setQueryData(officeSettingsQueryKey, settings)
    },
    onError: (error) => {
      toast({ variant: "error", title: error.message })
    },
  })
}
