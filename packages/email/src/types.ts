export interface EmailMessage {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
  headers?: Record<string, string>
}

export interface EmailProvider {
  send(
    message: EmailMessage,
    options?: { idempotencyKey?: string }
  ): Promise<{ id?: string }>
}
