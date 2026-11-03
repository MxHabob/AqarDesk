"use client"

import { Button } from "@aqardesk/ui/components/button"
import { type ReactNode, useState } from "react"
import { useI18n } from "@/locales/client"

export function LoginAccordion({ children }: { children: ReactNode }) {
  const t = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="outline"
        aria-controls="login-email-options"
        aria-expanded={isOpen}
        className="w-full"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? t("auth.hideOtherOptions") : t("auth.showOtherOptions")}
      </Button>
      <div id="login-email-options" hidden={!isOpen} className="pt-4">
        {children}
      </div>
    </div>
  )
}
