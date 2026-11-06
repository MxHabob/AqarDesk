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
          backgroundColor: emailDesignTokens.color.surface,
          color: emailDesignTokens.color.foreground,
          fontFamily: "Arial, sans-serif",
          padding: "20px 12px",
        }}
      >
        <Container
          style={{
            backgroundColor: emailDesignTokens.color.background,
            border: emailDesignTokens.border,
            borderRadius: emailDesignTokens.radius.card,
            margin: "0 auto",
            maxWidth: "560px",
            padding: "28px",
          }}
        >
          <Section>
            <Text
              style={{
                color: emailDesignTokens.color.foreground,
                fontSize: "15px",
                fontWeight: 700,
                margin: "0 0 24px",
              }}
            >
              {officeName}
            </Text>
            <Text>
              {isArabic ? `مرحبًا ${recipientName}،` : `Hello ${recipientName},`}
            </Text>
            <Heading
              style={{
                color: emailDesignTokens.color.foreground,
                fontSize: "22px",
              }}
            >
              {heading}
            </Heading>
            <Text
              style={{
                color: emailDesignTokens.color.mutedForeground,
                lineHeight: "1.7",
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
                  padding: "12px 20px",
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
                marginTop: "28px",
                paddingTop: "20px",
              }}
            >
              {isArabic ? "مع التحية،" : "Regards,"}
              <br />
              AqarDesk
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
