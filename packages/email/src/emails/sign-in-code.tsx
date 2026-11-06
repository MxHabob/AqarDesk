import { Heading, Text } from "@react-email/components"
import { EmailLayout } from "../components/email-layout"
import { emailDesignTokens } from "../design-tokens"
import { renderEmail } from "../render"

export async function createSignInCodeEmail(input: {
  to: string
  code: string
  locale: "ar" | "en"
  expiresInMinutes: number
  officeName?: string
}) {
  const arabic = input.locale === "ar"
  const officeName = input.officeName ?? (arabic ? "المكتب" : "Your office")
  const subject = arabic
    ? `${officeName} | رمز تسجيل الدخول`
    : `${officeName} | Sign-in code`
  const preview = arabic
    ? `رمز التحقق صالح لمدة ${input.expiresInMinutes} دقائق`
    : `Your verification code expires in ${input.expiresInMinutes} minutes`
  const heading = arabic ? "رمز تسجيل الدخول" : "Your sign-in code"
  const description = arabic
    ? `استخدم الرمز أدناه لإكمال تسجيل الدخول. تنتهي صلاحيته خلال ${input.expiresInMinutes} دقائق. إذا لم تطلبه، فتجاهل هذه الرسالة.`
    : `Use the code below to finish signing in. It expires in ${input.expiresInMinutes} minutes. If you did not request it, you can ignore this email.`
  const html = await renderEmail(
    <EmailLayout
      locale={input.locale}
      preview={preview}
      recipientName={arabic ? "بك" : "there"}
      heading={heading}
      description={description}
      officeName={officeName}
    >
      <Heading
        style={{
          color: emailDesignTokens.color.foreground,
          fontSize: "32px",
          letterSpacing: "8px",
          margin: "24px 0 8px",
          textAlign: input.locale === "ar" ? "right" : "left",
        }}
      >
        {input.code}
      </Heading>
      <Text
        style={{
          color: emailDesignTokens.color.mutedForeground,
          fontSize: "12px",
        }}
      >
        {arabic
          ? "لا تشارك هذا الرمز مع أي شخص."
          : "Never share this code with anyone."}
      </Text>
    </EmailLayout>
  )

  return {
    to: input.to,
    subject,
    html,
    text: `${heading}\n\n${description}\n\n${input.code}\n\n${arabic ? "لا تشارك هذا الرمز مع أي شخص." : "Never share this code with anyone."}\n\n${arabic ? "مع التحية،" : "Regards,"}\n${officeName}`,
  }
}
