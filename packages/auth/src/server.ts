import { getDatabase, schema } from "@aqardesk/database"
import { betterAuth, type Auth, type BetterAuthOptions } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { twoFactor } from "better-auth/plugins/two-factor"

export { toNextJsHandler } from "better-auth/next-js"

const secret = process.env.BETTER_AUTH_SECRET
const baseURL = process.env.BETTER_AUTH_URL
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const socialProviders =
  googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : {}

if (!secret || secret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be set to at least 32 characters.")
}

if (!baseURL) {
  throw new Error(
    "BETTER_AUTH_URL must be set to the canonical application URL."
  )
}

if (Boolean(googleClientId) !== Boolean(googleClientSecret)) {
  throw new Error(
    "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must both be configured."
  )
}

export const isGoogleAuthConfigured = Boolean(
  googleClientId && googleClientSecret
)

const authOptions: BetterAuthOptions = {
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
      twoFactor: schema.twoFactor,
    },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    minPasswordLength: 8,
  },
  socialProviders,
  plugins: [
    twoFactor({
      issuer: "AqarDesk",
      allowPasswordless: true,
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const database = getDatabase()

          await database.transaction(async (transaction) => {
            await transaction
              .insert(schema.roles)
              .values({
                id: "customer",
                key: "customer",
                name: "Customer",
                description: "Customer account",
              })
              .onConflictDoNothing()

            await transaction
              .insert(schema.userRoles)
              .values({ userId: user.id, roleId: "customer" })
              .onConflictDoNothing()
          })
        },
      },
    },
  },
}

export const auth: Auth<typeof authOptions> = betterAuth(authOptions)
