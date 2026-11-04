import { queryOptions } from "@tanstack/react-query"
import {
  getListingsTableData,
  getOwnersTableData,
  getPropertiesTableData,
  getRealEstateBulkCapabilities,
} from "@/actions/real-estate"

export const realEstateQueries = {
  properties: () =>
    queryOptions({
      queryKey: ["real-estate", "properties"],
      queryFn: getPropertiesTableData,
    }),
  listings: () =>
    queryOptions({
      queryKey: ["real-estate", "listings"],
      queryFn: getListingsTableData,
    }),
  owners: () =>
    queryOptions({
      queryKey: ["real-estate", "owners"],
      queryFn: getOwnersTableData,
    }),
  bulkCapabilities: () =>
    queryOptions({
      queryKey: ["real-estate", "bulk-capabilities"],
      queryFn: getRealEstateBulkCapabilities,
      staleTime: 60_000,
    }),
}
