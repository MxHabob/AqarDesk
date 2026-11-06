import { Link, Text } from "@react-email/components"
import { EmailLayout } from "../components/email-layout"
import { emailDesignTokens } from "../design-tokens"
import { renderEmail } from "../render"

export async function createListingUpdateEmail(input: {
  to: string
  recipientName: string
  officeName: string
  locale: "ar" | "en"
  propertyTitle: string
  listingType: "sale" | "rent"
  price: string
  listingUrl: string
}) {
  const arabic = input.locale === "ar"
  const listingType = arabic
    ? input.listingType === "sale"
      ? "للبيع"
      : "للإيجار"
    : input.listingType === "sale"
      ? "For sale"
      : "For rent"
  const subject = arabic ? "عقار جديد قد يهمك" : "A new property you may like"
  const preview = `${input.propertyTitle} — ${listingType}`
  const description = arabic
    ? "أُضيف عقار جديد إلى العروض. يمكنك الاطلاع على التفاصيل من الرابط أدناه."
    : "A new property has been listed. View its details using the link below."
  const html = await renderEmail(
    <EmailLayout
      locale={input.locale}
      preview={preview}
      recipientName={input.recipientName}
      heading={input.propertyTitle}
      description={description}
      actionLabel={arabic ? "عرض العقار" : "View property"}
      actionUrl={input.listingUrl}
      officeName={input.officeName}
    >
      <Text
        style={{
          backgroundColor: emailDesignTokens.color.surface,
          border: emailDesignTokens.border,
          borderRadius: emailDesignTokens.radius.control,
          color: emailDesignTokens.color.foreground,
          fontSize: "14px",
          padding: "12px 14px",
        }}
      >
        {listingType} · {input.price}
      </Text>
      <Text
        style={{
          color: emailDesignTokens.color.mutedForeground,
          fontSize: "12px",
        }}
      >
        <Link
          href="__EMAIL_UNSUBSCRIBE_URL__"
          style={{
            color: emailDesignTokens.color.mutedForeground,
            textDecoration: "underline",
          }}
        >
          {arabic
            ? "إلغاء إشعارات العقارات الجديدة"
            : "Unsubscribe from new property emails"}
        </Link>
      </Text>
    </EmailLayout>
  )

  return {
    to: input.to,
    subject,
    html,
    text: `${input.recipientName ? `${arabic ? "مرحبًا" : "Hello"} ${input.recipientName},\n\n` : ""}${description}\n\n${input.propertyTitle}\n${listingType} · ${input.price}\n${input.listingUrl}\n\n${arabic ? "إلغاء إشعارات العقارات الجديدة" : "Unsubscribe from new property emails"}: __EMAIL_UNSUBSCRIBE_URL__\n\n${arabic ? "مع التحية،" : "Regards,"}\n${input.officeName}`,
  }
}
