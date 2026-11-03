export type PaginationOptions = {
  page?: number
  pageSize?: number
  maximumPageSize?: number
}

export function normalizePagination({
  page = 1,
  pageSize = 25,
  maximumPageSize = 100,
}: PaginationOptions = {}) {
  const safeMaximum = Number.isSafeInteger(maximumPageSize)
    ? Math.max(1, maximumPageSize)
    : 100
  const safePage = Number.isSafeInteger(page) ? Math.max(1, page) : 1
  const safePageSize = Number.isSafeInteger(pageSize)
    ? Math.min(Math.max(1, pageSize), safeMaximum)
    : Math.min(25, safeMaximum)

  return {
    limit: safePageSize,
    offset: (safePage - 1) * safePageSize,
    page: safePage,
    pageSize: safePageSize,
  }
}
