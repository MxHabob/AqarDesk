import { queryOptions } from "@tanstack/react-query"
import {
  getOfficeSettingsAction,
  updateOfficeSettingsAction,
} from "@/actions/office-settings"

export const officeSettingsQueryKey = ["office-settings"] as const

export const officeSettingsQueryOptions = () =>
  queryOptions({
    queryKey: officeSettingsQueryKey,
    queryFn: getOfficeSettingsAction,
  })

export { updateOfficeSettingsAction }
