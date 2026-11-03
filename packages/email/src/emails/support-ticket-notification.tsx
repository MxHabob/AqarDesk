import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import { renderEmail } from "../render"

export interface SupportTicketNotificationInput {
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
    "A new AqarDesk support request was received.",
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
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: "#f6f7f8",
          fontFamily: "Arial, sans-serif",
          padding: "24px 12px",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            margin: "0 auto",
            maxWidth: "600px",
            padding: "28px",
          }}
        >
          <Heading style={{ fontSize: "20px", margin: "0 0 20px" }}>
            New AqarDesk support request
          </Heading>
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
        </Container>
      </Body>
    </Html>
  )

  return {
    subject: `[AqarDesk support] ${input.subject}`,
    text,
    html,
  }
}
