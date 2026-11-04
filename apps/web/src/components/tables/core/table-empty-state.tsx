"use client"

import { Button } from "@aqardesk/ui/button"

export function TableEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div className="flex h-[180px] flex-col items-center justify-center gap-2 px-4 text-center">
      <h2 className="text-sm font-medium">{title}</h2>
      <p className="max-w-md text-xs text-muted-foreground">{description}</p>
      <Button className="mt-2" size="sm" variant="outline" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  )
}
