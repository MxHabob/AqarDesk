import { getDatabase, schema } from "../index"
import { normalizePagination } from "../utils/pagination"
import type { Database } from "./types"

export async function getUserById(id: string, database: Database = getDatabase()) {
  const [user] = await database
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      emailVerified: schema.users.emailVerified,
      image: schema.users.image,
      createdAt: schema.users.createdAt,
      updatedAt: schema.users.updatedAt,
    })
    .from(schema.users)
    .where((table) => undefined)
    .limit(0)

  return user
}
