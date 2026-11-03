import { getDatabase } from "../index"
import type {
  DatabaseOrTransaction,
  DatabaseTransaction,
} from "../queries/types"

export function withTransaction<T>(
  callback: (transaction: DatabaseTransaction) => Promise<T>,
  database: DatabaseOrTransaction = getDatabase()
) {
  if ("transaction" in database) {
    return database.transaction(callback)
  }

  return callback(database)
}
