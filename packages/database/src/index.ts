import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "./schema"

type Database = ReturnType<typeof drizzle<typeof schema>>

const globalForDatabase = globalThis as typeof globalThis & {
  databaseClient?: ReturnType<typeof postgres>
  database?: Database
}

function getPoolSize() {
  const configuredPoolSize = process.env.DATABASE_POOL_MAX

  if (!configuredPoolSize) {
    return 10
  }

  const poolSize = Number(configuredPoolSize)

  if (!Number.isInteger(poolSize) || poolSize < 1) {
    throw new Error("DATABASE_POOL_MAX must be a positive integer.")
  }

  return poolSize
}

export function getDatabase() {
  if (globalForDatabase.database) {
    return globalForDatabase.database
  }

  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to connect to PostgreSQL.")
  }

  const client = postgres(databaseUrl, { max: getPoolSize() })

  globalForDatabase.databaseClient = client
  globalForDatabase.database = drizzle(client, { schema })

  return globalForDatabase.database
}

export async function closeDatabase() {
  await globalForDatabase.databaseClient?.end()
  delete globalForDatabase.databaseClient
  delete globalForDatabase.database
}

export * from "./queries"
export * from "./schema"
export * as schema from "./schema"
export * from "./utils"
