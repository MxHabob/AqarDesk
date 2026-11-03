import { getDatabase, schema } from "@aqardesk/database"
import { betterAuth, type Auth, type BetterAuthOptions } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { twoFactor } from "better-auth/plugins/two-factor"

export { toNextJsHandler } from "better-auth/next-js"

const secret = process.env.BETTER_AUTH_SECRET
const baseURL = process.env.BETTER_AUTH_URL
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const resendApiKey = process.env.RESEND_API_KEY
const emailFrom = process.env.EMAIL_FROM
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

if (Boolean(resendApiKey) !== Boolean(emailFrom)) {
  throw new Error("RESEND_API_KEY and EMAIL_FROM must both be configured.")
}

export const isGoogleAuthConfigured = Boolean(
  googleClientId && googleClientSecret
)
export const isEmailOtpConfigured = Boolean(resendApiKey && emailFrom)

const otpOptions = isEmailOtpConfigured
  ? {
      period: 3,
      digits: 6,
      sendOTP: async ({
        user,
        otp,
      }: {
        user: { email: string }
        otp: string
      }) => {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: emailFrom,
            to: [user.email],
            subject: "AqarDesk sign-in verification code",
            text: `Your AqarDesk verification code is ${otp}. It expires in three minutes. If you did not request it, you can ignore this email.\n\nرمز التحقق من عقار دِسك هو ${otp}. تنتهي صلاحيته خلال ثلاث دقائق.`,
            html: `<p>Your AqarDesk verification code is:</p><p style="font-size:24px;font-weight:600;letter-spacing:8px">${otp}</p><p>This code expires in three minutes. If you did not request it, you can ignore this email.</p><hr /><p dir="rtl">رمز التحقق من عقار دِسك هو <strong>${otp}</strong>. تنتهي صلاحيته خلال ثلاث دقائق.</p>`,
          }),
        })

        if (!response.ok) {
          throw new Error(
            `Resend rejected the MFA OTP email (${response.status} ${response.statusText}).`
          )
        }
      },
    }
  : undefined

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
      ...(otpOptions ? { otpOptions } : {}),
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
