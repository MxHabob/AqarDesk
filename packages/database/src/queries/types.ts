import type { getDatabase } from "../index"

export type Database = ReturnType<typeof getDatabase>
export type DatabaseTransaction = Parameters<
  Parameters<Database["transaction"]>[0]
>[0]
export type DatabaseOrTransaction = Database | DatabaseTransaction
