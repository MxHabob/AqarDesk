"use client"

import { Button } from "@aqardesk/ui/components/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function RecordActionButton({
  id,
  label,
  action,
  confirmMessage,
  destructive = false,
}: {
  id: string
  label: string
  action: (id: string) => Promise<void>
  confirmMessage?: string
  destructive?: boolean
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  async function run() {
    if (confirmMessage && !window.confirm(confirmMessage)) return
    setPending(true)
    setError("")
    try {
      await action(id)
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The action failed.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="text-end">
      <Button
        type="button"
        size="sm"
        variant={destructive ? "destructive" : "outline"}
        disabled={pending}
        onClick={() => void run()}
      >
        {pending ? "…" : label}
      </Button>
      {error && (
        <p role="alert" className="mt-1 max-w-56 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
