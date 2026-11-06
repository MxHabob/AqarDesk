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
import { emailDesignTokens } from "../design-tokens"

export interface EmailLayoutProps {
  locale?: "ar" | "en"
  preview: string
  recipientName: string
  heading: string
  description: string
  actionLabel?: string
  actionUrl?: string
  officeName: string
  children?: ReactNode
}

export function EmailLayout({
  locale = "ar",
  preview,
  recipientName,
  heading,
  description,
  actionLabel,
  actionUrl,
  officeName,
  children,
}: EmailLayoutProps) {
  const isArabic = locale === "ar"
  return (
    <Html lang={locale} dir={isArabic ? "rtl" : "ltr"}>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: emailDesignTokens.color.background,
          color: emailDesignTokens.color.foreground,
          fontFamily: "Arial, sans-serif",
          padding: "24px 16px",
        }}
      >
        <Container
          style={{
            margin: "0 auto",
            maxWidth: "520px",
            padding: "12px 8px",
          }}
        >
          <Section>
            <Text
              style={{
                color: emailDesignTokens.color.foreground,
                borderBottom: emailDesignTokens.border,
                fontSize: "16px",
                fontWeight: 700,
                margin: "0 0 28px",
                paddingBottom: "16px",
              }}
            >
              {officeName}
            </Text>
            <Text
              style={{
                color: emailDesignTokens.color.mutedForeground,
                fontSize: "14px",
                margin: "0 0 12px",
              }}
            >
              {isArabic ? `مرحبًا ${recipientName}،` : `Hello ${recipientName},`}
            </Text>
            <Heading
              style={{
                color: emailDesignTokens.color.foreground,
                fontSize: "23px",
                fontWeight: 700,
                lineHeight: "1.4",
                margin: "0 0 12px",
              }}
            >
              {heading}
            </Heading>
            <Text
              style={{
                color: emailDesignTokens.color.mutedForeground,
                lineHeight: "1.7",
                margin: "0 0 20px",
              }}
            >
              {description}
            </Text>
            {children}
            {actionLabel && actionUrl && (
              <Button
                href={actionUrl}
                style={{
                  backgroundColor: emailDesignTokens.color.primary,
                  border: emailDesignTokens.border,
                  borderRadius: emailDesignTokens.radius.control,
                  color: emailDesignTokens.color.primaryForeground,
                  display: "inline-block",
                  fontWeight: 700,
                  padding: "12px 18px",
                  textDecoration: "none",
                }}
              >
                {actionLabel}
              </Button>
            )}
            <Text
              style={{
                borderTop: emailDesignTokens.border,
                color: emailDesignTokens.color.mutedForeground,
                fontSize: "13px",
                marginTop: "28px",
                paddingTop: "16px",
              }}
            >
              {isArabic ? "مع التحية،" : "Regards,"}
              <br />
              <strong style={{ color: emailDesignTokens.color.foreground }}>
                {officeName}
              </strong>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
