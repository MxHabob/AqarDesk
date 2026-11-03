"use client"

import { queryOptions, useQuery } from "@tanstack/react-query"
import { authClient } from "@aqardesk/auth/client"

const userQueryOptions = queryOptions({
  queryKey: ["auth", "session"],
  queryFn: async () => {
    const { data, error } = await authClient.getSession()

    if (error) {
      throw new Error(error.message)
    }

    const user = data?.user

    return user
      ? {
          id: user.id,
          fullName: user.name,
          email: user.email,
          avatarUrl: user.image,
        }
      : null
  },
  staleTime: 5 * 60 * 1000,
})

export function useUserQuery() {
  return useQuery(userQueryOptions)
}
