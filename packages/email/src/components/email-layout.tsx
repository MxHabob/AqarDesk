import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import type { ReactNode } from "react"

export interface EmailLayoutProps {
  preview: string
  recipientName: string
  heading: string
  description: string
  actionLabel: string
  actionUrl: string
  officeName: string
  children?: ReactNode
}

export function EmailLayout({
  preview,
  recipientName,
  heading,
  description,
  actionLabel,
  actionUrl,
  officeName,
  children,
}: EmailLayoutProps) {
  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{ backgroundColor: "#f6f7f8", fontFamily: "Arial, sans-serif" }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            margin: "32px auto",
            maxWidth: "560px",
            padding: "32px",
          }}
        >
          <Section>
            <Text>مرحبًا {recipientName}،</Text>
            <Heading style={{ fontSize: "22px" }}>{heading}</Heading>
            <Text>{description}</Text>
            {children}
            <Button
              href={actionUrl}
              style={{
                backgroundColor: "#111111",
                borderRadius: "8px",
                color: "#ffffff",
                display: "inline-block",
                padding: "12px 20px",
                textDecoration: "none",
              }}
            >
              {actionLabel}
            </Button>
            <Text>
              مع التحية،
              <br />
              {officeName}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
