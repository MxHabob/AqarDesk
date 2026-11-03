"use server"

import { auth } from "@aqardesk/auth/server"
import { deleteUser } from "@aqardesk/database/queries"
import { headers } from "next/headers"

export async function deleteCurrentAccountAction() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")

  const deletedUser = await deleteUser(session.user.id, {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  })
  if (!deletedUser) throw new Error("Account could not be deleted.")

  return { id: deletedUser.id }
}
