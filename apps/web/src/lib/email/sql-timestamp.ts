import { sql } from "drizzle-orm"

export function sqlTimestamp(value: Date) {
  return sql`${value.toISOString()}::timestamptz`
}
