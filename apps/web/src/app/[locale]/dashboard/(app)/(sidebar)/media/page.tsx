import { auth } from "@aqardesk/auth/server"
import { listAllListingMedia } from "@aqardesk/database/queries"
import { createReadUrl, storageProvider } from "@aqardesk/storage/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { deleteManagedMediaAction } from "@/actions/operations"
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
  return { title: t("mediaTitle") }
}

export default async function MediaPage({
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
  if (!(await hasPermission(session.user.id, "media.manage"))) {
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
  const firstResult = await listAllListingMedia({
    query,
    page: requestedPage,
    pageSize,
  })
  const totalPages = Math.max(1, Math.ceil(firstResult.total / pageSize))
  const page = Math.min(requestedPage, totalPages)
  const result =
    page === requestedPage
      ? firstResult
      : await listAllListingMedia({ query, page, pageSize })
  const media = await Promise.all(
    result.rows.map(async (item) => ({
      ...item,
      readUrl:
        item.storageProvider === storageProvider
          ? (await createReadUrl(item.objectKey)).url
          : null,
    }))
  )

  return (
    <main className="space-y-5 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("mediaTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("mediaDescription")}</p>
      </header>
      <form
        action={`/${locale}/dashboard/media`}
        method="get"
        className="flex gap-2"
      >
        <input
          name="q"
          defaultValue={query}
          placeholder={t("searchMedia")}
          aria-label={t("searchMedia")}
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
              <th className="p-3 text-start">{t("file")}</th>
              <th className="p-3 text-start">{t("property")}</th>
              <th className="p-3 text-start">{t("type")}</th>
              <th className="p-3 text-start">{t("size")}</th>
              <th className="p-3 text-start">{t("createdAt")}</th>
              <th className="p-3 text-end">{t("action")}</th>
            </tr>
          </thead>
          <tbody>
            {media.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border last:border-0"
              >
                <td className="max-w-64 truncate p-3">
                  {item.readUrl ? (
                    <a
                      href={item.readUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4"
                    >
                      {item.originalFilename ?? item.id}
                    </a>
                  ) : (
                    (item.originalFilename ?? item.id)
                  )}
                  {item.isPrimary && (
                    <span className="ms-2 text-xs text-muted-foreground">
                      {t("primary")}
                    </span>
                  )}
                </td>
                <td className="p-3">{item.propertyTitle}</td>
                <td className="p-3">{item.type}</td>
                <td className="p-3 whitespace-nowrap">
                  {item.sizeBytes
                    ? `${(item.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
                    : "—"}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                  }).format(item.createdAt)}
                </td>
                <td className="p-3">
                  <RecordActionButton
                    id={item.id}
                    label={t("delete")}
                    action={deleteManagedMediaAction}
                    destructive
                    confirmMessage={t("confirmDeleteMedia")}
                  />
                </td>
              </tr>
            ))}
            {media.length === 0 && (
              <tr>
                <td
                  colSpan={6}
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
              href={`/${locale}/dashboard/media?q=${encodeURIComponent(query)}&page=${page - 1}`}
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
              href={`/${locale}/dashboard/media?q=${encodeURIComponent(query)}&page=${page + 1}`}
            >
              {t("next")}
            </a>
          )}
        </div>
      </div>
    </main>
  )
}
