import { auth } from "@aqardesk/auth/server"
import { listAllShortLinks } from "@aqardesk/database/queries"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { revokeManagedShortLinkAction } from "@/actions/operations"
import { RecordActionButton } from "@/components/operations/record-action-button"
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
  return { title: t("linksTitle") }
}

export default async function ShareLinksPage({
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
  if (!(await hasPermission(session.user.id, "listings.share"))) {
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
  const firstResult = await listAllShortLinks({
    query,
    page: requestedPage,
    pageSize,
  })
  const totalPages = Math.max(1, Math.ceil(firstResult.total / pageSize))
  const page = Math.min(requestedPage, totalPages)
  const result =
    page === requestedPage
      ? firstResult
      : await listAllShortLinks({ query, page, pageSize })

  return (
    <main className="space-y-5 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("linksTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("linksDescription")}</p>
        <p className="text-xs text-muted-foreground">{t("linksTokenNote")}</p>
      </header>
      <form
        action={`/${locale}/dashboard/settings/share-links`}
        method="get"
        className="flex gap-2"
      >
        <input
          name="q"
          defaultValue={query}
          placeholder={t("searchLinks")}
          aria-label={t("searchLinks")}
          className="h-9 w-full max-w-sm border border-input bg-background px-3 text-sm"
        />
        <button className="h-9 border border-border px-4 text-sm" type="submit">
          {t("search")}
        </button>
      </form>
      <div className="overflow-x-auto border-y border-border">
        <table className="w-full min-w-[780px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-start">{t("resource")}</th>
              <th className="p-3 text-start">{t("createdAt")}</th>
              <th className="p-3 text-start">{t("expiresAt")}</th>
              <th className="p-3 text-start">{t("status")}</th>
              <th className="p-3 text-end">{t("action")}</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((link) => {
              const isExpired = link.expiresAt <= new Date()
              const status = link.revokedAt
                ? t("revoked")
                : isExpired
                  ? t("expired")
                  : t("active")
              return (
                <tr
                  key={link.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="p-3">
                    <div>{link.propertyTitle ?? link.resourceType}</div>
                    <div className="text-xs text-muted-foreground">
                      {link.resourceType} · {link.resourceId}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                    }).format(link.createdAt)}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                    }).format(link.expiresAt)}
                  </td>
                  <td className="p-3">{status}</td>
                  <td className="p-3">
                    {!link.revokedAt && !isExpired && (
                      <RecordActionButton
                        id={link.id}
                        label={t("revoke")}
                        action={revokeManagedShortLinkAction}
                        destructive
                        confirmMessage={t("confirmRevokeLink")}
                      />
                    )}
                  </td>
                </tr>
              )
            })}
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
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{t("recordCount", { count: result.total })}</span>
        <div className="flex gap-3">
          {page > 1 && (
            <a
              className="underline"
              href={`/${locale}/dashboard/settings/share-links?q=${encodeURIComponent(query)}&page=${page - 1}`}
            >
              {t("previous")}
            </a>
          )}
          <span>
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <a
              className="underline"
              href={`/${locale}/dashboard/settings/share-links?q=${encodeURIComponent(query)}&page=${page + 1}`}
            >
              {t("next")}
            </a>
          )}
        </div>
      </div>
    </main>
  )
}
