import type { ReactNode } from "react"
import { EmailLayout } from "../components/email-layout"
import { renderEmail } from "../render"
import type { EmailMessage } from "../types"

export function validateActionUrl(value: string) {
  const url = new URL(value)

  if (
    (url.protocol !== "https:" && url.protocol !== "http:") ||
    url.username ||
    url.password
  ) {
    throw new Error("Email action URL must use HTTP or HTTPS.")
  }

  return url.toString()
}

export async function createActionEmail({
  to,
  recipientName,
  officeName,
  subject,
  preview,
  heading,
  description,
  actionLabel,
  actionUrl,
  children,
  text,
}: {
  to: string
  recipientName: string
  officeName: string
  subject: string
  preview: string
  heading: string
  description: string
  actionLabel: string
  actionUrl: string
  children?: ReactNode
  text: string
}): Promise<EmailMessage> {
  const safeActionUrl = validateActionUrl(actionUrl)
  const html = await renderEmail(
    <EmailLayout
      preview={preview}
      recipientName={recipientName}
      heading={heading}
      description={description}
      actionLabel={actionLabel}
      actionUrl={safeActionUrl}
      officeName={officeName}
    >
      {children}
    </EmailLayout>
  )

  return { to, subject, html, text }
}
