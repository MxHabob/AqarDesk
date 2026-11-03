import { Skeleton } from "@aqardesk/ui/skeleton"

export function SettingsLoading({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-12" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="h-40 w-full" />
      ))}
    </div>
  )
}
