import { auth } from "@aqardesk/auth/server"
import { getDatabase, schema } from "@aqardesk/database"
import { count, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { MetricsGrid } from "@/components/metrics/metrics-grid"
import { assertPermission } from "@/lib/auth/permissions"
import { getScopedI18n, initializeLocale } from "@/locales/server"

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = await initializeLocale(params)
  const [t, metricsT, requestHeaders] = await Promise.all([
    getScopedI18n("dashboard"),
    getScopedI18n("metrics"),
    headers(),
  ])
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session) {
    redirect("/login")
  }

  await assertPermission(session.user.id, "listings.read")
  const database = getDatabase()
  const [all, active, sale, rent] = await Promise.all([
    database.select({ total: count() }).from(schema.listings),
    database
      .select({ total: count() })
      .from(schema.listings)
      .where(eq(schema.listings.status, "active")),
    database
      .select({ total: count() })
      .from(schema.listings)
      .where(eq(schema.listings.type, "sale")),
    database
      .select({ total: count() })
      .from(schema.listings)
      .where(eq(schema.listings.type, "rent")),
  ])
  const metrics = {
    all: all[0]?.total ?? 0,
    active: active[0]?.total ?? 0,
    sale: sale[0]?.total ?? 0,
    rent: rent[0]?.total ?? 0,
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{t("greeting")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
      </header>
      <MetricsGrid
        metrics={metrics}
        labels={{
          all: metricsT("all"),
          active: metricsT("available"),
          sale: metricsT("sales"),
          rent: metricsT("rentals"),
        }}
        description={metricsT("noChange")}
        locale={locale}
      />
    </div>
  )
}
