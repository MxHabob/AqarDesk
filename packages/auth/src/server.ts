import { getDatabase, schema } from "@aqardesk/database"
import type { EmailMessage } from "@aqardesk/email"
import {
  createResendEmailProvider,
  createSignInCodeEmail,
  createWelcomeEmail,
} from "@aqardesk/email"
import { type Auth, type BetterAuthOptions, betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { emailOTP } from "better-auth/plugins/email-otp"
import { twoFactor } from "better-auth/plugins/two-factor"

export { toNextJsHandler } from "better-auth/next-js"

const secret = process.env.BETTER_AUTH_SECRET
const baseURL = process.env.BETTER_AUTH_URL
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const resendApiKey = process.env.RESEND_API_KEY?.trim()
const emailFrom = process.env.EMAIL_FROM?.trim()
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

const resendProvider =
  isEmailOtpConfigured && resendApiKey && emailFrom
    ? createResendEmailProvider({ apiKey: resendApiKey, from: emailFrom })
    : undefined

async function sendResendEmail(message: EmailMessage) {
  if (!resendProvider) {
    throw new Error("Email delivery is not configured.")
  }
  await resendProvider.send(message)
}

async function getEmailContext(email: string) {
  const database = getDatabase()
  const [user, office] = await Promise.all([
    database.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email.toLowerCase()),
      columns: { locale: true },
    }),
    database.query.officeSettings.findFirst({
      columns: { name: true },
    }),
  ])
  const locale: "ar" | "en" = user?.locale === "en" ? "en" : "ar"
  return {
    locale,
    officeName:
      office?.name.trim() || (locale === "ar" ? "المكتب" : "Your office"),
  }
}

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
        const { locale, officeName } = await getEmailContext(user.email)
        const message = await createSignInCodeEmail({
          to: user.email,
          code: otp,
          locale,
          expiresInMinutes: 3,
          officeName,
        })
        await sendResendEmail(message)
      },
    }
  : undefined

const emailOTPPlugin = otpOptions
  ? emailOTP({
      otpLength: 6,
      expiresIn: 180,
      sendVerificationOTP: async ({ email, otp }) => {
        const { locale, officeName } = await getEmailContext(email)
        const message = await createSignInCodeEmail({
          to: email,
          code: otp,
          locale,
          expiresInMinutes: 3,
          officeName,
        })
        await sendResendEmail(message)
      },
    })
  : undefined

const emailOtpMfaGuard = {
  id: "email-otp-mfa-guard",
  hooks: {
    before: [
      {
        matcher: (context: { path?: string }) =>
          context.path === "/sign-in/email-otp" ||
          context.path === "/email-otp/send-verification-otp",
        handler: createAuthMiddleware(async (context) => {
          const email = context.body?.email
          const isSignInRequest =
            context.path === "/sign-in/email-otp" ||
            context.body?.type === "sign-in"

          if (typeof email !== "string" || !isSignInRequest) {
            return
          }

          const user = await getDatabase().query.users.findFirst({
            where: (users, { eq }) => eq(users.email, email.toLowerCase()),
            columns: { twoFactorEnabled: true },
          })

          if (user?.twoFactorEnabled) {
            throw new APIError("FORBIDDEN", {
              message:
                "This account requires its configured second factor. Use a supported sign-in method.",
            })
          }
        }),
      },
    ],
  },
}

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
    enabled: false,
  },
  socialProviders,
  plugins: [
    ...(emailOTPPlugin ? [emailOTPPlugin, emailOtpMfaGuard] : []),
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

            if (user.emailVerified) {
              const locale = user.locale === "en" ? "en" : "ar"
              const office = await transaction.query.officeSettings.findFirst({
                columns: { name: true },
              })
              const welcome = await createWelcomeEmail({
                to: user.email,
                recipientName: user.name,
                officeName:
                  office?.name.trim() ||
                  (locale === "ar" ? "المكتب" : "Your office"),
                locale,
                accountUrl: new URL(`/${locale}/listings`, baseURL).toString(),
              })
              await transaction
                .insert(schema.emailOutbox)
                .values({
                  dedupeKey: `welcome:${user.id}`,
                  recipientUserId: user.id,
                  recipientEmail: user.email,
                  category: "transactional",
                  subject: welcome.subject,
                  html: welcome.html,
                  text: welcome.text,
                })
                .onConflictDoNothing()
            }
          })
        },
      },
    },
  },
}

export const auth: Auth<typeof authOptions> = betterAuth(authOptions)
