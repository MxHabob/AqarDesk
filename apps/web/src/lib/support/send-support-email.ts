import {
  createResendEmailProvider,
  createSupportTicketNotificationEmail,
} from "@aqardesk/email"
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
  await createResendEmailProvider({ apiKey, from }).send({
    ...email,
    to: SUPPORT_EMAIL,
    replyTo: input.email.trim().toLowerCase(),
  })

  return { sent: true }
}
