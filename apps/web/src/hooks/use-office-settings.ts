"use client"

import { useToast } from "@aqardesk/ui/use-toast"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import {
  officeMetricsSettingsQueryKey,
  officeMetricsSettingsQueryOptions,
  officeSettingsQueryKey,
  officeSettingsQueryOptions,
  updateOfficeSettingsAction,
} from "@/queries/office-settings"

export function useOfficeMetricsSettingsQuery() {
  return useSuspenseQuery(officeMetricsSettingsQueryOptions())
}

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
      queryClient.setQueryData(officeMetricsSettingsQueryKey, {
        id: settings.id,
        fiscalYearStartMonth: settings.fiscalYearStartMonth,
      })
    },
    onError: (error) => {
      toast({ type: "error", title: error.message })
    },
  })
}
