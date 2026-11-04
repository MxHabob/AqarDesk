import { auth } from "@aqardesk/auth/server"
import {
  propertyFieldsByType,
  propertyTypeLabels,
  propertyTypeValues,
} from "@aqardesk/categories"
import { getOfficeSettings } from "@aqardesk/database/queries"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { z } from "zod"
import { savePropertyFieldSettingsAction } from "@/actions/property-field-settings"
import { hasPermission } from "@/lib/auth/permissions"
import { setStaticParamsLocale } from "@/locales/server"

export const metadata: Metadata = {
  title: "إعدادات حقول العقارات | AqarDesk",
}

export default async function PropertyFieldSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ type?: string; saved?: string }>
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams])
  setStaticParamsLocale(locale)
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(`/${locale}/login`)

  if (!(await hasPermission(session.user.id, "office_settings.manage"))) {
    return (
      <div role="alert" className="space-y-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          ليس لديك صلاحية إدارة إعدادات الحقول.
        </p>
        <Link href={`/${locale}/dashboard`} className="text-sm underline">
          العودة إلى لوحة التحكم
        </Link>
      </div>
    )
  }

  const parsedType = z.enum(propertyTypeValues).safeParse(query.type)
  const selectedType = parsedType.success
    ? parsedType.data
    : propertyTypeValues[0]
  const settings = await getOfficeSettings()
  const fieldSettings = settings.propertyFieldSettings?.[selectedType] ?? {}

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold">إعدادات حقول العقارات</h1>
        <p className="text-sm text-muted-foreground">
          تحكم في ظهور الحقول في نموذج الإدارة وصفحة العقار العامة، وغيّر تسميتها
          وترتيبها. الحقول المخفية لا تُحذف بياناتها.
        </p>
      </header>
      {query.saved === "1" && (
        <p
          role="status"
          className="border border-green-700/30 bg-green-700/5 p-3 text-sm text-green-800 dark:text-green-300"
        >
          تم حفظ إعدادات الحقول.
        </p>
      )}

      <nav aria-label="فئات العقارات" className="flex flex-wrap gap-2">
        {propertyTypeValues.map((type) => (
          <Link
            key={type}
            href={`/${locale}/dashboard/settings/fields?type=${type}`}
            aria-current={type === selectedType ? "page" : undefined}
            className={`border px-3 py-2 text-sm ${
              type === selectedType
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:bg-muted"
            }`}
          >
            {propertyTypeLabels[type]}
          </Link>
        ))}
      </nav>

      <form action={savePropertyFieldSettingsAction} className="space-y-4">
        <input type="hidden" name="type" value={selectedType} />
        <input type="hidden" name="locale" value={locale} />
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/50 text-start">
              <tr>
                <th scope="col" className="p-3 text-start font-medium">
                  الحقل
                </th>
                <th scope="col" className="p-3 text-start font-medium">
                  التسمية
                </th>
                <th scope="col" className="p-3 text-center font-medium">
                  نموذج الإدارة
                </th>
                <th scope="col" className="p-3 text-center font-medium">
                  الصفحة العامة
                </th>
                <th scope="col" className="p-3 text-center font-medium">
                  مطلوب
                </th>
                <th scope="col" className="p-3 text-start font-medium">
                  الترتيب
                </th>
              </tr>
            </thead>
            <tbody>
              {propertyFieldsByType[selectedType].map((field, index) => {
                const config = fieldSettings[field.key]
                const isTitle = field.key === "title"
                return (
                  <tr key={field.key} className="border-t border-border">
                    <th scope="row" className="p-3 text-start font-normal">
                      {field.label}
                      {isTitle && (
                        <span className="ms-1 text-xs text-muted-foreground">
                          أساسي
                        </span>
                      )}
                    </th>
                    <td className="p-2">
                      <input
                        aria-label={`تسمية ${field.label}`}
                        name={`label_${field.key}`}
                        defaultValue={config?.label ?? field.label}
                        maxLength={100}
                        className="h-9 w-full border border-input bg-background px-2"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        name={`form_${field.key}`}
                        defaultChecked={
                          isTitle || config?.visibleInForm !== false
                        }
                        disabled={isTitle}
                        aria-label={`إظهار ${field.label} في نموذج الإدارة`}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        name={`public_${field.key}`}
                        defaultChecked={
                          isTitle ||
                          (config?.visiblePublicly ??
                            ![
                              "address",
                              "primaryStreet",
                              "secondaryStreet",
                            ].includes(field.key))
                        }
                        disabled={isTitle}
                        aria-label={`إظهار ${field.label} في الصفحة العامة`}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        name={`required_${field.key}`}
                        defaultChecked={isTitle || config?.required === true}
                        disabled={isTitle}
                        aria-label={`جعل ${field.label} مطلوبًا`}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        name={`order_${field.key}`}
                        min={0}
                        max={999}
                        defaultValue={config?.order ?? index}
                        aria-label={`ترتيب ${field.label}`}
                        className="h-9 w-20 border border-input bg-background px-2"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
        >
          حفظ الإعدادات
        </button>
      </form>
    </section>
  )
}
