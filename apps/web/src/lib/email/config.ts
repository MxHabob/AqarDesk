import { createResendEmailProvider } from "@aqardesk/email"

export function getEmailSiteOrigin() {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim()
  if (!configuredOrigin) {
    throw new Error(
      "Set NEXT_PUBLIC_APP_URL or BETTER_AUTH_URL to send application emails."
    )
  }

  const url = new URL(configuredOrigin)
  if (
    (url.protocol !== "https:" && url.protocol !== "http:") ||
    url.username ||
    url.password
  ) {
    throw new Error("The application email URL must be an HTTP(S) origin.")
  }
  return url.origin
}

export function getEmailProvider() {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.EMAIL_FROM?.trim()
  if (!apiKey || !from) {
    throw new Error("Set RESEND_API_KEY and EMAIL_FROM to send email.")
  }
  return createResendEmailProvider({ apiKey, from })
}
