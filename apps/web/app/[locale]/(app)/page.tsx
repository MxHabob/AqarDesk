import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/components/card"
import { getScopedI18n } from "@/locales/server"

export default async function DashboardPage() {
  const t = await getScopedI18n("dashboard")

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{t("greeting")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>{t("activeListings")}</CardDescription>
            <CardTitle>—</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t("availableSoon")}
          </CardContent>
        </Card>
      </section>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t("recentListings")}</h2>
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            {t("availableSoon")}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
