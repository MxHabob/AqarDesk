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
    const updateVisibility = () => setIsVisible(window.scrollY > 240)
    updateVisibility()
    window.addEventListener("scroll", updateVisibility, { passive: true })
    return () => window.removeEventListener("scroll", updateVisibility)
  }, [])

  if (!href || !isVisible) return null

  return (
    <motion.div
      className="fixed inset-x-4 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-40 flex justify-end pointer-events-none"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
    >
      <Button
        render={<a href={href} target="_blank" rel="noreferrer" />}
        className="pointer-events-auto h-11 gap-2 px-4"
        aria-label={t("askUs")}
      >
        <Icons.WhatsApp aria-hidden="true" className="size-5" />
        {t("askUs")}
      </Button>
    </motion.div>
  )
}
