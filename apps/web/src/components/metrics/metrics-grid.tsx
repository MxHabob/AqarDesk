import { MetricCard } from "./metric-card"

export function MetricsGrid({
  metrics,
  labels,
  description,
  locale,
}: {
  metrics: { all: number; active: number; sale: number; rent: number }
  labels: { all: string; active: string; sale: string; rent: string }
  description: string
  locale: string
}) {
  return (
    <section
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-label={labels.all}
    >
      <MetricCard
        label={labels.all}
        value={metrics.all}
        description={description}
        locale={locale}
      />
      <MetricCard
        label={labels.active}
        value={metrics.active}
        description={description}
        locale={locale}
      />
      <MetricCard
        label={labels.sale}
        value={metrics.sale}
        description={description}
        locale={locale}
      />
      <MetricCard
        label={labels.rent}
        value={metrics.rent}
        description={description}
        locale={locale}
      />
    </section>
  )
}
