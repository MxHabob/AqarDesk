"use server"

import { auth } from "@aqardesk/auth/server"
import { propertyFieldsByType, propertyTypeValues } from "@aqardesk/categories"
import {
  getOfficeSettings,
  updateOfficeSettings,
} from "@aqardesk/database/queries"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { assertPermission } from "@/lib/auth/permissions"

export async function savePropertyFieldSettingsAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")
  await assertPermission(session.user.id, "office_settings.manage")

  const parsedType = z.enum(propertyTypeValues).safeParse(formData.get("type"))
  if (!parsedType.success) throw new TypeError("نوع العقار غير صالح.")

  const propertyType = parsedType.data
  const locale = z.enum(["ar", "en"]).parse(formData.get("locale"))
  const fields = propertyFieldsByType[propertyType]
  const fieldSettings = Object.fromEntries(
    fields.map(({ key, label }) => {
      const customLabel = String(formData.get(`label_${key}`) ?? "").trim()
      const parsedOrder = Number(formData.get(`order_${key}`))
      const visibleInForm =
        formData.get(`form_${key}`) === "on" || key === "title"

      return [
        key,
        {
          visibleInForm,
          visiblePublicly:
            formData.get(`public_${key}`) === "on" || key === "title",
          required:
            (formData.get(`required_${key}`) === "on" && visibleInForm) ||
            key === "title",
          label: customLabel.slice(0, 100) || label,
          order:
            Number.isInteger(parsedOrder) && parsedOrder >= 0
              ? parsedOrder
              : fields.findIndex((field) => field.key === key),
        },
      ]
    })
  )

  const currentSettings = await getOfficeSettings()
  await updateOfficeSettings({
    propertyFieldSettings: {
      ...currentSettings.propertyFieldSettings,
      [propertyType]: fieldSettings,
    },
    updatedById: session.user.id,
  })

  revalidatePath("/[locale]/dashboard/settings/fields", "page")
  revalidatePath("/[locale]/dashboard", "layout")
  redirect(`/${locale}/dashboard/settings/fields?type=${propertyType}&saved=1`)
}
