import { auth } from "@aqardesk/auth/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { BaseCurrency } from "@/components/base-currency/base-currency"
import { CompanyCountry } from "@/components/company-country"
import { CompanyEmail } from "@/components/company-email"
import { CompanyFiscalYear } from "@/components/company-fiscal-year"
import { CompanyLogo } from "@/components/company-logo"
import { CompanyName } from "@/components/company-name"
import { CompanyPhone } from "@/components/company-phone"
import { DeleteTeam } from "@/components/delete-team"
import { ExportAllData } from "@/components/export-all-data"
import { SettingsLoading } from "@/components/settings-loading"
import { TeamIdSection } from "@/components/team-id-section"
import { hasPermission } from "@/lib/auth/permissions"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"
import { officeSettingsQueryOptions } from "@/queries/office-settings"
import { getQueryClient, HydrateClient } from "@/queries/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("teamManagement")

  return { title: t("settingsPageTitle") }
}

export default async function Account({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect(`/${locale}/login`)
  }

  if (!(await hasPermission(session.user.id, "office_settings.read"))) {
    const t = await getScopedI18n("teamManagement")

    return (
      <div
        role="alert"
        className="mx-auto max-w-xl space-y-3 py-16 text-center"
      >
        <h1 className="text-lg font-semibold">{t("accessDenied")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("accessDeniedDescription")}
        </p>
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex h-9 items-center border border-border px-4 text-sm hover:bg-muted"
        >
          {t("backToDashboard")}
        </Link>
      </div>
    )
  }

  void getQueryClient().prefetchQuery(officeSettingsQueryOptions())

  return (
    <HydrateClient>
      <Suspense fallback={<SettingsLoading count={10} />}>
        <div className="space-y-12">
          <CompanyLogo />
          <CompanyName />
          <CompanyEmail />
          <CompanyPhone />
          <CompanyCountry />
          <BaseCurrency />
          <CompanyFiscalYear />
          <TeamIdSection />
          <ExportAllData />
          <DeleteTeam />
        </div>
      </Suspense>
    </HydrateClient>
  )
}
