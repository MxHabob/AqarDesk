"use client"

import { Button } from "@aqardesk/ui/button"
import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { Portal } from "@/components/portal"

type BottomBarProps = {
  position?: "top" | "bottom"
  children: ReactNode
} & (
  | {
      statusLabel: string
      selectedCount?: never
      onDeselect?: never
      selectedLabel?: never
      deselectLabel?: never
    }
  | {
      statusLabel?: never
      selectedCount: number
      onDeselect: () => void
      selectedLabel: string
      deselectLabel: string
    }
)

/** Shared action bar for table selection and pending form changes. */
export function BottomBar({
  position = "bottom",
  children,
  ...props
}: BottomBarProps) {
  return (
    <Portal>
      <motion.div
        className={`fixed ${position === "top" ? "top-6" : "bottom-6"} start-0 end-0 z-50 flex h-12 justify-center pointer-events-none`}
        initial={{ y: position === "top" ? -100 : 100 }}
        animate={{ y: 0 }}
        exit={{ y: position === "top" ? -100 : 100 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="relative pointer-events-auto h-12 w-[min(100%-2rem,720px)]">
          {/* Blur layer fades in separately to avoid backdrop-filter animation issues */}
          <motion.div
            className="absolute inset-0 backdrop-filter backdrop-blur-lg bg-[rgba(247,247,247,0.85)] dark:bg-[rgba(19,19,19,0.7)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
          <div className="relative flex h-12 items-center justify-between gap-2 overflow-hidden ps-4 pe-2">
            {"statusLabel" in props ? (
              <span className="min-w-0 truncate text-sm" role="status">
                {props.statusLabel}
              </span>
            ) : (
              <span className="shrink-0 text-sm">
                {props.selectedCount} {props.selectedLabel}
              </span>
            )}

            <div className="flex min-w-0 items-center gap-x-1 overflow-x-auto scrollbar-hide sm:gap-x-2">
              {"onDeselect" in props && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={props.onDeselect}
                >
                  <span>{props.deselectLabel}</span>
                </Button>
              )}

              {children}
            </div>
          </div>
        </div>
      </motion.div>
    </Portal>
  )
}
