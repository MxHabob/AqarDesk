import { createActionEmail } from "./utils"

export interface StaffInvitationEmailInput {
  to: string
  recipientName: string
  officeName: string
  invitationUrl: string
  expiresInHours: number
  locale?: "ar" | "en"
}

export async function createStaffInvitationEmail(
  input: StaffInvitationEmailInput
) {
  if (!Number.isInteger(input.expiresInHours) || input.expiresInHours < 1) {
    throw new RangeError(
      "Invitation expiry must be a positive number of hours."
    )
  }

  const description = `تمت دعوتك للانضمام إلى ${input.officeName}. ينتهي رابط الدعوة خلال ${input.expiresInHours} ساعة.`
  const locale = input.locale ?? "ar"
  const localizedDescription =
    locale === "ar"
      ? description
      : `You have been invited to join ${input.officeName}. This invitation expires in ${input.expiresInHours} hours.`

  return createActionEmail({
    to: input.to,
    recipientName: input.recipientName,
    locale,
    officeName: input.officeName,
    subject:
      locale === "ar"
        ? "دعوة للانضمام إلى AqarDesk"
        : "Invitation to join AqarDesk",
    preview:
      locale === "ar"
        ? "دعوة للانضمام إلى فريق المكتب"
        : "Invitation to join the office team",
    heading:
      locale === "ar"
        ? "دعوة للانضمام إلى فريق المكتب"
        : "Invitation to join the office team",
    description: localizedDescription,
    actionLabel: locale === "ar" ? "قبول الدعوة" : "Accept invitation",
    actionUrl: input.invitationUrl,
    text: `${locale === "ar" ? `مرحبًا ${input.recipientName}،` : `Hello ${input.recipientName},`}\n\n${localizedDescription}\n\n${locale === "ar" ? "قبول الدعوة" : "Accept invitation"}: ${input.invitationUrl}\n\n${locale === "ar" ? "مع التحية،" : "Regards,"}\n${input.officeName}`,
  })
}
