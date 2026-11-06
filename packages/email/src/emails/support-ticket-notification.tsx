import { Section, Text } from "@react-email/components"
import { EmailLayout } from "../components/email-layout"
import { renderEmail } from "../render"

export interface SupportTicketNotificationInput {
  officeName: string
  fullName: string
  email: string
  subject: string
  type: string
  priority: string
  message: string
  sourceUrl?: string
}

export async function createSupportTicketNotificationEmail(
  input: SupportTicketNotificationInput
) {
  const preview = `New ${input.priority} support request: ${input.subject}`
  const text = [
    `A new support request was received by ${input.officeName}.`,
    "",
    `Name: ${input.fullName}`,
    `Email: ${input.email}`,
    `Type: ${input.type}`,
    `Priority: ${input.priority}`,
    `Subject: ${input.subject}`,
    "",
    input.message,
    ...(input.sourceUrl ? ["", `Page: ${input.sourceUrl}`] : []),
  ].join("\n")
  const html = await renderEmail(
    <EmailLayout
      locale="en"
      preview={preview}
      recipientName="support team"
      heading="New support request"
      description={`A new support request was received by ${input.officeName}.`}
      officeName={input.officeName}
    >
      <Section>
        <Text>
          <strong>From:</strong> {input.fullName} ({input.email})
        </Text>
        <Text>
          <strong>Type:</strong> {input.type}
        </Text>
        <Text>
          <strong>Priority:</strong> {input.priority}
        </Text>
        <Text>
          <strong>Subject:</strong> {input.subject}
        </Text>
        <Text style={{ whiteSpace: "pre-wrap" }}>{input.message}</Text>
        {input.sourceUrl && (
          <Text>
            <strong>Page:</strong> {input.sourceUrl}
          </Text>
        )}
      </Section>
    </EmailLayout>
  )

  return {
    subject: `[${input.officeName}] ${input.subject}`,
    text,
    html,
  }
}
