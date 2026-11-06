import { createActionEmail } from "./utils"

export async function createWelcomeEmail(input: {
  to: string
  recipientName: string
  officeName: string
  locale: "ar" | "en"
  accountUrl: string
}) {
  const copy =
    input.locale === "ar"
      ? {
          subject: `${input.officeName} | مرحبًا بك`,
          preview: "تم إنشاء حسابك بنجاح",
          heading: "مرحبًا بك",
          description:
            "يسعدنا انضمامك إلينا. يمكنك الآن استكشاف العقارات وإدارة تفضيلات حسابك.",
          actionLabel: "استكشف العقارات",
          text: `مرحبًا ${input.recipientName}،\n\nتم إنشاء حسابك بنجاح. يمكنك الآن استكشاف العقارات وإدارة تفضيلات حسابك.\n\nاستكشف العقارات: ${input.accountUrl}\n\nمع التحية،\n${input.officeName}`,
        }
      : {
          subject: `${input.officeName} | Welcome`,
          preview: "Your account is ready",
          heading: "Welcome",
          description:
            "We're glad you're here. You can now explore properties and manage your account preferences.",
          actionLabel: "Explore properties",
          text: `Hello ${input.recipientName},\n\nYour account is ready. You can now explore properties and manage your account preferences.\n\nExplore properties: ${input.accountUrl}\n\nRegards,\n${input.officeName}`,
        }

  return createActionEmail({
    to: input.to,
    locale: input.locale,
    recipientName: input.recipientName,
    officeName: input.officeName,
    ...copy,
    actionUrl: input.accountUrl,
  })
}
