import { createSupportTicketNotificationEmail } from "@aqardesk/email"
import { SUPPORT_EMAIL } from "@/utils/constants"

type SendSupportEmailInput = {
  fullName: string
  email: string
  subject: string
  type: string
  priority: "low" | "normal" | "high" | "urgent" | "0" | "1" | "2" | "3"
  message: string
  url?: string
}

function normalizePriority(
  priority: SendSupportEmailInput["priority"]
): "low" | "normal" | "high" | "urgent" {
  switch (priority) {
    case "0":
    case "low":
      return "low"
    case "1":
    case "normal":
      return "normal"
    case "2":
    case "high":
      return "high"
    case "3":
    case "urgent":
      return "urgent"
  }
}

export async function sendSupportEmail(input: SendSupportEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.EMAIL_FROM?.trim()

  if (!apiKey || !from) {
    throw new Error(
      "Support email is not configured. Set RESEND_API_KEY and EMAIL_FROM."
    )
  }

  const email = await createSupportTicketNotificationEmail({
    ...input,
    priority: normalizePriority(input.priority),
  })
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [SUPPORT_EMAIL],
      reply_to: input.email.trim().toLowerCase(),
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  })

  if (!response.ok) {
    throw new Error(
      `Resend rejected the support email (${response.status} ${response.statusText}).`
    )
  }

  return { sent: true }
}
