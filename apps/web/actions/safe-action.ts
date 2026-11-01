"use server"

import { headers } from "next/headers"
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action"

import { auth } from "@aqardesk/auth/server"

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    console.error("Server action failed", error)
    return DEFAULT_SERVER_ERROR_MESSAGE
  },
})

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    throw new Error("Unauthorized")
  }

  return next({
    ctx: {
      user: session.user,
      session: session.session,
    },
  })
})
