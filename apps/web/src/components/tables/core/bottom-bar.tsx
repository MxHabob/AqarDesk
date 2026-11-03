"use client"

import { Button } from "@aqardesk/ui/button"
import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { Portal } from "@/components/portal"

interface BottomBarProps {
  selectedCount: number
  onDeselect: () => void
  selectedLabel: string
  deselectLabel: string
  children: ReactNode
}

/**
 * Generic bottom bar for table multi-select actions
 * Appears at the bottom of the screen when items are selected
 */
export function BottomBar({
  selectedCount,
  onDeselect,
  selectedLabel,
  deselectLabel,
  children,
}: BottomBarProps) {
  return (
    <Portal>
      <motion.div
        className="h-12 fixed bottom-6 start-0 end-0 pointer-events-none flex justify-center z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="relative pointer-events-auto h-12 w-[min(100%-2rem,520px)]">
          {/* Blur layer fades in separately to avoid backdrop-filter animation issues */}
          <motion.div
            className="absolute inset-0 backdrop-filter backdrop-blur-lg bg-[rgba(247,247,247,0.85)] dark:bg-[rgba(19,19,19,0.7)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
          <div className="relative flex h-12 items-center justify-between gap-2 ps-4 pe-2">
            <span className="shrink-0 text-sm">
              {selectedCount} {selectedLabel}
            </span>

            <div className="flex min-w-0 items-center gap-x-1 sm:gap-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={onDeselect}
              >
                <span>{deselectLabel}</span>
              </Button>

              {children}
            </div>
          </div>
        </div>
      </motion.div>
    </Portal>
  )
}
