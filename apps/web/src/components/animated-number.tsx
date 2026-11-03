"use client"

import NumberFlow from "@number-flow/react"
import { useEffect, useRef } from "react"
import { useUserQuery } from "@/hooks/use-user"

type Props = {
  value: number
  currency?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export function AnimatedNumber({
  value,
  currency,
  minimumFractionDigits,
  maximumFractionDigits,
  locale,
}: Props) {
  const { data: user } = useUserQuery()
  const hasReceivedValue = useRef(false)

  useEffect(() => {
    if (value !== 0) hasReceivedValue.current = true
  }, [value])

  return (
    <NumberFlow
      value={value}
      animated={hasReceivedValue.current}
      format={{
        ...(currency ? { style: "currency" as const, currency } : {}),
        minimumFractionDigits,
        maximumFractionDigits,
      }}
      willChange
      locales={locale ?? user?.locale ?? "en"}
    />
  )
}
