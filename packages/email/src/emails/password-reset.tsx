import { createActionEmail } from "./utils"

export interface PasswordResetEmailInput {
  to: string
  recipientName: string
  officeName: string
  resetUrl: string
}

export async function createPasswordResetEmail(input: PasswordResetEmailInput) {
  const description =
    "وصلنا طلب لإعادة تعيين كلمة المرور. إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة."

  return createActionEmail({
    to: input.to,
    recipientName: input.recipientName,
    officeName: input.officeName,
    subject: "إعادة تعيين كلمة المرور",
    preview: "طلب إعادة تعيين كلمة المرور",
    heading: "طلب إعادة تعيين كلمة المرور",
    description,
    actionLabel: "إعادة تعيين كلمة المرور",
    actionUrl: input.resetUrl,
    text: `مرحبًا ${input.recipientName}،\n\n${description}\n\nإعادة تعيين كلمة المرور: ${input.resetUrl}\n\nمع التحية،\n${input.officeName}`,
  })
}
