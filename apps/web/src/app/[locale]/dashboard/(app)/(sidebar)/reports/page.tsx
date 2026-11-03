import { getInitialMetricsSettings } from "@/utils/metrics-settings"
import { MetricsContent } from "./metrics-content"

export default function ReportsPage() {
  const chartLayoutPromise = getInitialMetricsSettings()

  return <MetricsContent chartLayoutPromise={chartLayoutPromise} />
}
