import type { EmailMessage } from "./index"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function validateActionUrl(value: string) {
  const url = new URL(value)

  if (
    (url.protocol !== "https:" && url.protocol !== "http:") ||
    url.username ||
    url.password
  ) {
    throw new Error("Email action URL must use HTTP or HTTPS.")
  }

  return url.toString()
}

function actionEmail({
  recipientName,
  officeName,
  subject,
  heading,
  description,
  actionLabel,
  actionUrl,
}: {
  recipientName: string
  officeName: string
  subject: string
  heading: string
  description: string
  actionLabel: string
  actionUrl: string
}): EmailMessage {
  const safeUrl = escapeHtml(validateActionUrl(actionUrl))
  const safeOffice = escapeHtml(officeName)
  const safeName = escapeHtml(recipientName)
  const safeDescription = escapeHtml(description)

  return {
    to: "",
    subject,
    html: `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#f6f7f8;font-family:Arial,sans-serif;color:#202124"><main style="max-width:560px;margin:32px auto;padding:32px;background:#fff;border-radius:12px"><p>مرحبًا ${safeName}،</p><h1 style="font-size:22px">${escapeHtml(heading)}</h1><p>${safeDescription}</p><p><a href="${safeUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">${escapeHtml(actionLabel)}</a></p><p>مع التحية،<br>${safeOffice}</p></main></body></html>`,
    text: `مرحبًا ${recipientName}،\n\n${heading}\n${description}\n\n${actionLabel}: ${validateActionUrl(actionUrl)}\n\nمع التحية،\n${officeName}`,
  }
}

export function createStaffInvitationEmail(input: {
  to: string
  recipientName: string
  officeName: string
  invitationUrl: string
  expiresInHours: number
}): EmailMessage {
  if (!Number.isInteger(input.expiresInHours) || input.expiresInHours < 1) {
    throw new Error("Invitation expiry must be a positive number of hours.")
  }

  return {
    ...actionEmail({
      recipientName: input.recipientName,
      officeName: input.officeName,
      subject: "دعوة للانضمام إلى AqarDesk",
      heading: "دعوة للانضمام إلى فريق المكتب",
      description: `تمت دعوتك للانضمام إلى ${input.officeName}. ينتهي رابط الدعوة خلال ${input.expiresInHours} ساعة.`,
      actionLabel: "قبول الدعوة",
      actionUrl: input.invitationUrl,
    }),
    to: input.to,
  }
}

export function createPasswordResetEmail(input: {
  to: string
  recipientName: string
  officeName: string
  resetUrl: string
}): EmailMessage {
  return {
    ...actionEmail({
      recipientName: input.recipientName,
      officeName: input.officeName,
      subject: "إعادة تعيين كلمة المرور",
      heading: "طلب إعادة تعيين كلمة المرور",
      description:
        "وصلنا طلب لإعادة تعيين كلمة المرور. إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.",
      actionLabel: "إعادة تعيين كلمة المرور",
      actionUrl: input.resetUrl,
    }),
    to: input.to,
  }
}
