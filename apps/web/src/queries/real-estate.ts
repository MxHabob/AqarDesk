import { queryOptions } from "@tanstack/react-query"
import {
  getListingsTableData,
  getOwnersTableData,
  getPropertiesTableData,
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
}
