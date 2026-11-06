import { auth } from "@aqardesk/auth/server"
import { propertyTypeValues } from "@aqardesk/categories"
import { getOfficeSettings } from "@aqardesk/database/queries"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { PropertyFieldSettingsPageContent } from "@/components/settings/property-field-settings-page-content"
import { hasPermission } from "@/lib/auth/permissions"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("propertyFieldSettings")
  return { title: `${t("title")} | AqarDesk` }
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
  const t = await getScopedI18n("propertyFieldSettings")
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(`/${locale}/login`)

  if (!(await hasPermission(session.user.id, "office_settings.manage"))) {
    return (
      <p role="alert" className="py-12 text-center">
        {t("accessDenied")}
      </p>
    )
  }

  const parsedType = z.enum(propertyTypeValues).safeParse(query.type)
  const selectedType = parsedType.success
    ? parsedType.data
    : propertyTypeValues[0]
  const settings = await getOfficeSettings()
  const fieldSettings = settings.propertyFieldSettings?.[selectedType] ?? {}

  return (
    <PropertyFieldSettingsPageContent
      locale={locale}
      selectedType={selectedType}
      fieldSettings={fieldSettings}
      saved={query.saved === "1"}
    />
  )
}
