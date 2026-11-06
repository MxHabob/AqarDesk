import type { EmailMessage, EmailProvider } from "./types"

export function createResendEmailProvider({
  apiKey,
  from,
}: {
  apiKey: string
  from: string
}): EmailProvider {
  if (!apiKey.trim() || !from.trim()) {
    throw new Error("Resend email API key and sender address are required.")
  }

  return {
    async send(message: EmailMessage, options) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...(options?.idempotencyKey
            ? { "Idempotency-Key": options.idempotencyKey }
            : {}),
        },
        body: JSON.stringify({
          from,
          to: [message.to],
          subject: message.subject,
          html: message.html,
          text: message.text,
          ...(message.replyTo ? { reply_to: message.replyTo } : {}),
          ...(message.headers ? { headers: message.headers } : {}),
        }),
      })

      if (!response.ok) {
        const body = await response.text()
        let providerMessage = ""
        try {
          const parsed: unknown = JSON.parse(body)
          if (
            typeof parsed === "object" &&
            parsed !== null &&
            "message" in parsed &&
            typeof parsed.message === "string"
          ) {
            providerMessage = parsed.message
          }
        } catch {
          providerMessage = body.slice(0, 500)
        }

        throw new Error(
          `Resend rejected the email (${response.status} ${response.statusText})${providerMessage ? `: ${providerMessage}` : ""}.`
        )
      }

      const body: unknown = await response.json()
      if (
        typeof body === "object" &&
        body !== null &&
        "id" in body &&
        typeof body.id === "string"
      ) {
        return { id: body.id }
      }
      return {}
    },
  }
}
