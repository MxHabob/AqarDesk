import { auth } from "@aqardesk/auth/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BaseCurrency } from "@/components/base-currency/base-currency"
import { CompanyCountry } from "@/components/company-country"
import { CompanyEmail } from "@/components/company-email"
import { CompanyFiscalYear } from "@/components/company-fiscal-year"
import { CompanyLogo } from "@/components/company-logo"
import { CompanyName } from "@/components/company-name"
import { DeleteTeam } from "@/components/delete-team"
import { ExportAllData } from "@/components/export-all-data"
import { TeamIdSection } from "@/components/team-id-section"
import { hasPermission } from "@/lib/auth/permissions"
import { officeSettingsQueryOptions } from "@/queries/office-settings"
import { getQueryClient, HydrateClient } from "@/queries/server"

export const metadata: Metadata = {
  title: "Team Settings | AqarDesk",
}

export default async function Account({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect(`/${locale}/login`)
  }

  if (!(await hasPermission(session.user.id, "office_settings.read"))) {
    const isArabic = locale === "ar"

    return (
      <div
        role="alert"
        className="mx-auto max-w-xl space-y-3 py-16 text-center"
      >
        <h1 className="text-lg font-semibold">
          {isArabic ? "لا تملك صلاحية الوصول" : "Access denied"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isArabic
            ? "ليس لديك صلاحية عرض إعدادات المكتب. تواصل مع مسؤول المكتب إذا كنت تعتقد أن هذا غير صحيح."
            : "You don't have permission to view office settings. Contact your office administrator if you think this is a mistake."}
        </p>
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex h-9 items-center border border-border px-4 text-sm hover:bg-muted"
        >
          {isArabic ? "العودة إلى لوحة التحكم" : "Back to dashboard"}
        </Link>
      </div>
    )
  }

  await getQueryClient().prefetchQuery(officeSettingsQueryOptions())

  return (
    <HydrateClient>
      <div className="space-y-12">
        <CompanyLogo />
        <CompanyName />
        <CompanyEmail />
        <CompanyCountry />
        <BaseCurrency />
        <CompanyFiscalYear />
        <TeamIdSection />
        <ExportAllData />
        <DeleteTeam />
      </div>
    </HydrateClient>
  )
}
