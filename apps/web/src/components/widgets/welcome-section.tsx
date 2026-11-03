"use client"

import { TZDate } from "@date-fns/tz"
import { useSuspenseQuery } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { getDashboardSummaryAction } from "@/actions/dashboard"
import { useUserQuery } from "@/hooks/use-user"
import { useI18n } from "@/locales/client"

function getTimeBasedGreeting(
  timezone?: string
): "greetingMorning" | "greetingAfternoon" | "greetingEvening" {
  const userTimezone =
    timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  const now = new TZDate(new Date(), userTimezone)
  const hour = now.getHours()

  if (hour >= 5 && hour < 12) {
    return "greetingMorning"
  }
  if (hour >= 12 && hour < 17) {
    return "greetingAfternoon"
  }

  return "greetingEvening"
}

type Insight = {
  key: string
  before: string
  link: string
  after: string
  href: string
}

const linkClass =
  "border-b border-dashed border-[#878787]/30 hover:text-foreground transition-colors"

type SummaryData = {
  propertyCount: number
  listingCount: number
  ownerCount: number
  access: {
    properties: boolean
    listings: boolean
    owners: boolean
  }
}

function buildInsights(
  data: SummaryData,
  labels: {
    summaryPrefix: string
    properties: string
    listings: string
    owners: string
  }
): Insight[] {
  const insights: Insight[] = []

  if (data.access.properties) {
    insights.push({
      key: "properties",
      href: "#",
      before: `${labels.summaryPrefix} `,
      link: `${data.propertyCount} ${labels.properties}`,
      after: ".",
    })
  }
  if (data.access.listings) {
    insights.push({
      key: "listings",
      href: "#",
      before: `${labels.summaryPrefix} `,
      link: `${data.listingCount} ${labels.listings}`,
      after: ".",
    })
  }
  if (data.access.owners) {
    insights.push({
      key: "owners",
      href: "#",
      before: `${labels.summaryPrefix} `,
      link: `${data.ownerCount} ${labels.owners}`,
      after: ".",
    })
  }

  return insights
}

const TICK_DURATION = 6000

function SummaryTicker({
  insights,
  label,
}: {
  insights: Insight[]
  label: string
}) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [fast, setFast] = useState(false)
  const [progress, setProgress] = useState(0)
  const hoveredRef = useRef(false)
  const startRef = useRef(Date.now())
  const elapsedOnPauseRef = useRef(0)

  const goTo = useCallback(
    (i: number) => {
      const next = i % insights.length
      if (next === index) return
      setFast(true)
      setDirection(next > index ? 1 : -1)
      setIndex(next)
      setProgress(0)
      startRef.current = Date.now()
      elapsedOnPauseRef.current = 0
    },
    [insights.length, index]
  )

  useEffect(() => {
    if (insights.length <= 1) return

    let raf: number

    const tick = () => {
      if (hoveredRef.current) {
        raf = requestAnimationFrame(tick)
        return
      }

      const elapsed =
        elapsedOnPauseRef.current + (Date.now() - startRef.current)
      const pct = Math.min(elapsed / TICK_DURATION, 1)
      setProgress(pct)

      if (pct >= 1) {
        setFast(false)
        setDirection(1)
        setIndex((prev) => (prev + 1) % insights.length)
        setProgress(0)
        startRef.current = Date.now()
        elapsedOnPauseRef.current = 0
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [insights.length])

  if (insights.length === 0) return null

  const current = insights[index % insights.length]
  if (!current) return null
  const slideY = (fast ? 8 : 14) * direction
  const duration = fast ? 0.12 : 0.32

  if (insights.length <= 1) {
    return (
      <p className="text-muted-foreground text-sm mt-3 max-w-lg leading-relaxed text-center">
        {current.before}
        {current.link && (
          <Link href={current.href} className={linkClass}>
            {current.link}
          </Link>
        )}
        {current.after}
      </p>
    )
  }

  return (
    <section
      aria-label={label}
      className="flex flex-col items-center max-w-lg w-full gap-3"
      onMouseEnter={() => {
        hoveredRef.current = true
        elapsedOnPauseRef.current += Date.now() - startRef.current
      }}
      onMouseLeave={() => {
        hoveredRef.current = false
        startRef.current = Date.now()
      }}
    >
      <div className="relative h-10 overflow-hidden w-full">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={current.key}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ y: slideY, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -slideY, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-muted-foreground text-sm leading-relaxed text-center">
              {current.before}
              {current.link && (
                <Link href={current.href} className={linkClass}>
                  {current.link}
                </Link>
              )}
              {current.after}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1.5">
        {insights.map((insight, i) => (
          <button
            key={insight.key}
            type="button"
            className="group/bar relative cursor-pointer py-2 -my-2"
            onClick={() => goTo(i)}
            onMouseEnter={() => goTo(i)}
          >
            <div className="relative h-[2px] w-4 rounded-full bg-primary/10 overflow-hidden">
              <div
                className="absolute inset-0 bg-primary/40 rounded-full origin-left group-hover/bar:!scale-x-100"
                style={{
                  transform: `scaleX(${i === index ? progress : 0})`,
                }}
              />
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

export function WelcomeGreeting() {
  const t = useI18n()
  const { data: user } = useUserQuery()
  const [greeting, setGreeting] = useState(() =>
    getTimeBasedGreeting(user?.timezone ?? undefined)
  )

  useEffect(() => {
    setGreeting(getTimeBasedGreeting(user?.timezone ?? undefined))

    const interval = setInterval(
      () => {
        setGreeting(getTimeBasedGreeting(user?.timezone ?? undefined))
      },
      5 * 60 * 1000
    )

    return () => clearInterval(interval)
  }, [user?.timezone])

  const firstName = user?.fullName?.split(" ")[0]

  return (
    <h1 className="text-[38px] font-serif leading-tight text-center">
      {t(`realEstateDashboard.${greeting}`)}
      {firstName ? (
        <>
          , <span className="text-muted-foreground">{firstName}</span>
        </>
      ) : null}
    </h1>
  )
}

export function WelcomeSummary() {
  const t = useI18n()
  const { data } = useSuspenseQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummaryAction,
  })
  const insights = buildInsights(data, {
    summaryPrefix: t("realEstateDashboard.summaryPrefix"),
    properties: t("realEstateDashboard.properties"),
    listings: t("realEstateDashboard.listings"),
    owners: t("realEstateDashboard.owners"),
  })

  return (
    <SummaryTicker
      insights={insights}
      label={t("realEstateDashboard.summaryLabel")}
    />
  )
}
