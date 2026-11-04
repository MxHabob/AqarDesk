import { auth } from "@aqardesk/auth/server"
import { listAuditLogs } from "@aqardesk/database/queries"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/auth/permissions"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

const pageSize = 50

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("operationsManagement")
  return { title: t("auditTitle") }
}

export default async function AuditPage({
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
  if (!(await hasPermission(session.user.id, "audit.read"))) {
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
  const firstResult = await listAuditLogs({
    query,
    page: requestedPage,
    pageSize,
  })
  const totalPages = Math.max(1, Math.ceil(firstResult.total / pageSize))
  const page = Math.min(requestedPage, totalPages)
  const result =
    page === requestedPage
      ? firstResult
      : await listAuditLogs({ query, page, pageSize })

  return (
    <main className="space-y-5 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("auditTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("auditDescription")}</p>
      </header>
      <form
        action={`/${locale}/dashboard/audit`}
        method="get"
        className="flex gap-2"
      >
        <input
          name="q"
          defaultValue={query}
          placeholder={t("searchAudit")}
          aria-label={t("searchAudit")}
          className="h-9 w-full max-w-sm border border-input bg-background px-3 text-sm"
        />
        <button className="h-9 border border-border px-4 text-sm" type="submit">
          {t("search")}
        </button>
      </form>
      <div className="overflow-x-auto border-y border-border">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-start">
              <th className="p-3 text-start">{t("date")}</th>
              <th className="p-3 text-start">{t("actor")}</th>
              <th className="p-3 text-start">{t("action")}</th>
              <th className="p-3 text-start">{t("entity")}</th>
              <th className="p-3 text-start">{t("entityId")}</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="p-3 whitespace-nowrap">
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(row.createdAt)}
                </td>
                <td className="p-3">
                  <div>{row.actorName ?? t("systemActor")}</div>
                  {row.actorEmail && (
                    <div className="text-xs text-muted-foreground">
                      {row.actorEmail}
                    </div>
                  )}
                </td>
                <td className="p-3 font-mono text-xs">{row.action}</td>
                <td className="p-3">{row.entityType}</td>
                <td className="max-w-56 truncate p-3 font-mono text-xs">
                  {row.entityId ?? "—"}
                </td>
              </tr>
            ))}
            {result.rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-muted-foreground"
                >
                  {t("noResults")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{t("recordCount", { count: result.total })}</span>
        <div className="flex gap-3">
          {page > 1 && (
            <Link
              href={`/${locale}/dashboard/audit?q=${encodeURIComponent(query)}&page=${page - 1}`}
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
              href={`/${locale}/dashboard/audit?q=${encodeURIComponent(query)}&page=${page + 1}`}
              className="underline underline-offset-4"
            >
              {t("next")}
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
