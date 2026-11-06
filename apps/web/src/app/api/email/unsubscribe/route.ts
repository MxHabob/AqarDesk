import { getDatabase, schema } from "@aqardesk/database"
import { eq } from "drizzle-orm"
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")
  if (!verifyUnsubscribeToken(token)) {
    return new Response("This unsubscribe link is invalid.", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    })
  }

  const isArabic = url.searchParams.get("locale") === "ar"
  const title = isArabic ? "إلغاء إشعارات العقارات" : "Unsubscribe"
  const description = isArabic
    ? "أكد إلغاء إشعارات العقارات الجديدة. لن تتأثر رسائل الحساب الضرورية."
    : "Confirm to stop receiving new property listing emails. Essential account messages are not affected."
  const button = isArabic ? "إلغاء الاشتراك" : "Unsubscribe"
  const actionUrl = `/api/email/unsubscribe?token=${encodeURIComponent(token ?? "")}&locale=${isArabic ? "ar" : "en"}`
  return new Response(
    `<!doctype html><html lang="${isArabic ? "ar" : "en"}" dir="${isArabic ? "rtl" : "ltr"}"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title><body><main><h1>${title}</h1><p>${description}</p><form action="${actionUrl}" method="post"><button type="submit">${button}</button></form></main></body></html>`,
    {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/html; charset=utf-8",
      },
    }
  )
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")
  const userId = verifyUnsubscribeToken(token)
  if (!userId) {
    return new Response("This unsubscribe link is invalid.", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    })
  }

  await getDatabase()
    .update(schema.users)
    .set({
      listingEmailNotifications: false,
      listingEmailNotificationsUpdatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, userId))

  const successMessage =
    url.searchParams.get("locale") === "ar"
      ? "تم إلغاء الاشتراك من إشعارات العقارات الجديدة."
      : "You have been unsubscribed from property emails."
  return new Response(successMessage, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
