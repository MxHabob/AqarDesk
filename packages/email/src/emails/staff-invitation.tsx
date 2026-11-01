import { createActionEmail } from "./utils"

export interface StaffInvitationEmailInput {
  to: string
  recipientName: string
  officeName: string
  invitationUrl: string
  expiresInHours: number
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

  return createActionEmail({
    to: input.to,
    recipientName: input.recipientName,
    officeName: input.officeName,
    subject: "دعوة للانضمام إلى AqarDesk",
    preview: "دعوة للانضمام إلى فريق المكتب",
    heading: "دعوة للانضمام إلى فريق المكتب",
    description,
    actionLabel: "قبول الدعوة",
    actionUrl: input.invitationUrl,
    text: `مرحبًا ${input.recipientName}،\n\n${description}\n\nقبول الدعوة: ${input.invitationUrl}\n\nمع التحية،\n${input.officeName}`,
  })
}
