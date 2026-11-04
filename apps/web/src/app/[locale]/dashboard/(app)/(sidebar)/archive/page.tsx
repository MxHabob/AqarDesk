import { auth } from "@aqardesk/auth/server"
import {
  listArchivedOwners,
  listArchivedProperties,
} from "@aqardesk/database/queries"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  restoreArchivedOwnerAction,
  restoreArchivedPropertyAction,
} from "@/actions/operations"
import { RecordActionButton } from "@/components/operations/record-action-button"
import { hasPermission } from "@/lib/auth/permissions"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("operationsManagement")
  return { title: t("archiveTitle") }
}

export default async function ArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const [{ locale }, search] = await Promise.all([params, searchParams])
  setStaticParamsLocale(locale)
  const [session, t] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getScopedI18n("operationsManagement"),
  ])
  if (!session) redirect(`/${locale}/login`)
  const [canArchiveProperties, canManageOwners] = await Promise.all([
    hasPermission(session.user.id, "properties.archive"),
    hasPermission(session.user.id, "owners.update"),
  ])
  if (!canArchiveProperties && !canManageOwners) {
    return (
      <p role="alert" className="py-12 text-center">
        {t("accessDenied")}
      </p>
    )
  }

  const query = typeof search.q === "string" ? search.q.trim() : ""
  const pageNumber = Number(search.page ?? 1)
  const requestedPage =
    Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1
  const loadPage = (page: number) =>
    Promise.all([
      canArchiveProperties
        ? listArchivedProperties({ page, pageSize: 50, query })
        : Promise.resolve({ rows: [], total: 0 }),
      canManageOwners
        ? listArchivedOwners({ page, pageSize: 50, query })
        : Promise.resolve({ rows: [], total: 0 }),
    ])
  const firstPage = await loadPage(requestedPage)
  let properties = firstPage[0]
  let owners = firstPage[1]
  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(properties.total, owners.total) / 50)
  )
  const page = Math.min(requestedPage, totalPages)
  if (page !== requestedPage) {
    const safePage = await loadPage(page)
    properties = safePage[0]
    owners = safePage[1]
  }

  return (
    <main className="space-y-8 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("archiveTitle")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("archiveDescription")}
        </p>
      </header>
      <form
        action={`/${locale}/dashboard/archive`}
        method="get"
        className="flex gap-2"
      >
        <input
          name="q"
          defaultValue={query}
          placeholder={t("searchArchive")}
          aria-label={t("searchArchive")}
          className="h-9 w-full max-w-sm border border-input bg-background px-3 text-sm"
        />
        <button className="h-9 border border-border px-4 text-sm" type="submit">
          {t("search")}
        </button>
      </form>
      {canArchiveProperties && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">
            {t("archivedProperties")} ({properties.total})
          </h2>
          <div className="overflow-x-auto border-y border-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-start">{t("name")}</th>
                  <th className="p-3 text-start">{t("location")}</th>
                  <th className="p-3 text-start">{t("archivedAt")}</th>
                  <th className="p-3 text-end">{t("action")}</th>
                </tr>
              </thead>
              <tbody>
                {properties.rows.map((property) => (
                  <tr
                    key={property.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="p-3">{property.title}</td>
                    <td className="p-3">
                      {[property.city, property.district]
                        .filter(Boolean)
                        .join("، ") || "—"}
                    </td>
                    <td className="p-3">
                      {property.archivedAt
                        ? new Intl.DateTimeFormat(locale, {
                            dateStyle: "medium",
                          }).format(property.archivedAt)
                        : "—"}
                    </td>
                    <td className="p-3">
                      <RecordActionButton
                        id={property.id}
                        label={t("restore")}
                        action={restoreArchivedPropertyAction}
                      />
                    </td>
                  </tr>
                ))}
                {properties.rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-6 text-center text-muted-foreground"
                    >
                      {t("noResults")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {canManageOwners && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">
            {t("archivedOwners")} ({owners.total})
          </h2>
          <div className="overflow-x-auto border-y border-border">
            <table className="w-full min-w-[540px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-start">{t("name")}</th>
                  <th className="p-3 text-start">{t("archivedAt")}</th>
                  <th className="p-3 text-end">{t("action")}</th>
                </tr>
              </thead>
              <tbody>
                {owners.rows.map((owner) => (
                  <tr
                    key={owner.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="p-3">{owner.name}</td>
                    <td className="p-3">
                      {owner.archivedAt
                        ? new Intl.DateTimeFormat(locale, {
                            dateStyle: "medium",
                          }).format(owner.archivedAt)
                        : "—"}
                    </td>
                    <td className="p-3">
                      <RecordActionButton
                        id={owner.id}
                        label={t("restore")}
                        action={restoreArchivedOwnerAction}
                      />
                    </td>
                  </tr>
                ))}
                {owners.rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-6 text-center text-muted-foreground"
                    >
                      {t("noResults")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <div className="flex items-center justify-end gap-3 text-sm text-muted-foreground">
        {page > 1 && (
          <Link
            href={`/${locale}/dashboard/archive?q=${encodeURIComponent(query)}&page=${page - 1}`}
            className="underline underline-offset-4"
          >
            {t("previous")}
          </Link>
        )}
        <span>
          {page} / {totalPages}
        </span>
        {page < totalPages && (
          <Link
            href={`/${locale}/dashboard/archive?q=${encodeURIComponent(query)}&page=${page + 1}`}
            className="underline underline-offset-4"
          >
            {t("next")}
          </Link>
        )}
      </div>
    </main>
  )
}
