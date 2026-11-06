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
  const textDirection = isArabic ? "rtl" : "ltr"
  const textAlignment = isArabic ? "right" : "left"
  return (
    <Html lang={locale} dir={textDirection}>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        dir={textDirection}
        style={{
          backgroundColor: emailDesignTokens.color.background,
          color: emailDesignTokens.color.foreground,
          fontFamily: "Arial, sans-serif",
          padding: "24px 16px",
          textAlign: textAlignment,
        }}
      >
        <Container
          dir={textDirection}
          style={{
            margin: "0 auto",
            maxWidth: "520px",
            padding: "12px 8px",
          }}
        >
          <Section dir={textDirection} style={{ textAlign: textAlignment }}>
            <Text
              dir={textDirection}
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
              dir={textDirection}
              style={{
                color: emailDesignTokens.color.mutedForeground,
                fontSize: "14px",
                margin: "0 0 12px",
                textAlign: textAlignment,
              }}
            >
              {isArabic ? `مرحبًا ${recipientName}،` : `Hello ${recipientName},`}
            </Text>
            <Heading
              dir={textDirection}
              style={{
                color: emailDesignTokens.color.foreground,
                fontSize: "23px",
                fontWeight: 700,
                lineHeight: "1.4",
                margin: "0 0 12px",
                textAlign: textAlignment,
              }}
            >
              {heading}
            </Heading>
            <Text
              dir={textDirection}
              style={{
                color: emailDesignTokens.color.mutedForeground,
                lineHeight: "1.7",
                margin: "0 0 20px",
                textAlign: textAlignment,
              }}
            >
              {description}
            </Text>
            {children}
            {actionLabel && actionUrl && (
              <Button
                dir={textDirection}
                href={actionUrl}
                style={{
                  backgroundColor: emailDesignTokens.color.primary,
                  border: "none",
                  borderRadius: emailDesignTokens.radius.control,
                  color: emailDesignTokens.color.primaryForeground,
                  display: "inline-block",
                  fontSize: "15px",
                  fontWeight: 700,
                  lineHeight: "1.5",
                  padding: "13px 22px",
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                {actionLabel}
              </Button>
            )}
            <Text
              dir={textDirection}
              style={{
                borderTop: emailDesignTokens.border,
                color: emailDesignTokens.color.mutedForeground,
                fontSize: "13px",
                marginTop: "28px",
                paddingTop: "16px",
                textAlign: textAlignment,
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
