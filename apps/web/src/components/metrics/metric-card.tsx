import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/components/card"

export function MetricCard({
  label,
  value,
  description,
  locale,
}: {
  label: string
  value: number
  description: string
  locale: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <CardTitle className="text-2xl tabular-nums">
          {new Intl.NumberFormat(locale).format(value)}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        {description}
      </CardContent>
    </Card>
  )
}
