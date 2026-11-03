import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query"

export function makeQueryClient() {
  return new QueryClient({
    queryCache: isServer
      ? undefined
      : new QueryCache({
          onError: (error) => {
            if (
              error instanceof Error &&
              "data" in error &&
              typeof error.data === "object" &&
              error.data !== null &&
              "code" in error.data &&
              error.data.code === "UNAUTHORIZED"
            ) {
              window.location.href = "/login"
            }
          },
        }),
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: isServer ? false : 2,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  })
}
