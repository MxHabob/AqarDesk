"use client"

import { Button } from "@aqardesk/ui/button"
import { Icons } from "@aqardesk/ui/icons"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { useScopedI18n } from "@/locales/client"

export function FloatingContactButton({ href }: { href: string | null }) {
  const t = useScopedI18n("site")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let scrollTimeout: number | undefined

    const updateVisibility = () => {
      window.clearTimeout(scrollTimeout)
      setIsVisible(false)
      scrollTimeout = window.setTimeout(
        () => setIsVisible(window.scrollY > 240),
        500
      )
    }

    setIsVisible(window.scrollY > 240)
    window.addEventListener("scroll", updateVisibility, { passive: true })
    return () => {
      window.clearTimeout(scrollTimeout)
      window.removeEventListener("scroll", updateVisibility)
    }
  }, [])

  if (!href || !isVisible) return null

  return (
    <motion.div
      className="fixed inset-x-4 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-40 flex justify-end pointer-events-none"
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      <Button
        render={<a href={href} target="_blank" rel="noreferrer" />}
        className="pointer-events-auto size-11 justify-center p-0 sm:size-auto sm:h-11 sm:gap-2 sm:px-4"
        aria-label={t("askUs")}
      >
        <Icons.WhatsApp aria-hidden="true" className="size-5" />
        <span className="hidden sm:inline">{t("askUs")}</span>
      </Button>
    </motion.div>
  )
}
