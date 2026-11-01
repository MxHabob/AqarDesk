import { getDatabase, schema } from "@workspace/database"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

export { toNextJsHandler } from "better-auth/next-js"

const secret = process.env.BETTER_AUTH_SECRET
const baseURL = process.env.BETTER_AUTH_URL

if (!secret || secret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be set to at least 32 characters.")
}

if (!baseURL) {
  throw new Error(
    "BETTER_AUTH_URL must be set to the canonical application URL."
  )
}

export const auth = betterAuth({
  appName: "AqarDesk",
  baseURL,
  secret,
  database: drizzleAdapter(getDatabase(), {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
})
