import { queryOptions } from "@tanstack/react-query"
import {
  getOfficeMetricsSettingsAction,
  getOfficeSettingsAction,
  updateOfficeSettingsAction,
} from "@/actions/office-settings"

export const officeSettingsQueryKey = ["office-settings"] as const
export const officeMetricsSettingsQueryKey = [
  "office-metrics-settings",
] as const

export const officeSettingsQueryOptions = () =>
  queryOptions({
    queryKey: officeSettingsQueryKey,
    queryFn: getOfficeSettingsAction,
  })

export const officeMetricsSettingsQueryOptions = () =>
  queryOptions({
    queryKey: officeMetricsSettingsQueryKey,
    queryFn: getOfficeMetricsSettingsAction,
  })

export { updateOfficeSettingsAction }
