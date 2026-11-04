"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@aqardesk/ui/alert-dialog"
import { Button } from "@aqardesk/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@aqardesk/ui/components/dropdown-menu"
import { Input } from "@aqardesk/ui/input"
import { useToast } from "@aqardesk/ui/use-toast"
import { ChevronDown, Loader2, Trash2 } from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"
import { BottomBar } from "./bottom-bar"

export type BulkActionResult = {
  affectedCount: number
  skippedCount: number
  cleanupFailedCount?: number
  details?: string
  failedIds?: string[]
}

export type BulkActionOption = {
  id: string
  label: string
}

export function BulkActions({
  selectedCount,
  selectedLabel,
  deselectLabel,
  actionLabel,
  deleteLabel,
  deleteTitle,
  deleteDescription,
  deletePrompt,
  confirmationKeyword,
  confirmLabel,
  cancelLabel,
  successLabel,
  partialLabel,
  partialDescription,
  cleanupFailedDescription,
  actionErrorLabel,
  actions,
  children,
  onAction,
  onDeselect,
  onComplete,
}: {
  selectedCount: number
  selectedLabel: string
  deselectLabel: string
  actionLabel: string
  deleteLabel: string
  deleteTitle: string
  deleteDescription: string
  deletePrompt: string
  confirmationKeyword: string
  confirmLabel: string
  cancelLabel: string
  successLabel: (actionId: string, affectedCount: number) => string
  partialLabel: string
  partialDescription: string
  cleanupFailedDescription: string
  actionErrorLabel: string
  actions: BulkActionOption[]
  children?: ReactNode
  onAction: (id: string) => Promise<BulkActionResult>
  onDeselect: () => void
  onComplete: (result: BulkActionResult) => void
}) {
  const { toast } = useToast()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [isPending, setIsPending] = useState(false)

  const execute = async (id: string) => {
    setIsPending(true)
    try {
      const result = await onAction(id)
      onComplete(result)
      setIsDeleteOpen(false)
      setConfirmation("")

      const hasWarnings =
        result.skippedCount > 0 || (result.cleanupFailedCount ?? 0) > 0
      toast({
        type: hasWarnings ? "warning" : "success",
        title: hasWarnings
          ? partialLabel
          : successLabel(id, result.affectedCount),
        description: hasWarnings
          ? [
              partialDescription
                .replace("{affected}", String(result.affectedCount))
                .replace("{skipped}", String(result.skippedCount)),
              result.cleanupFailedCount
                ? cleanupFailedDescription.replace(
                    "{count}",
                    String(result.cleanupFailedCount)
                  )
                : undefined,
              result.details,
            ]
              .filter(Boolean)
              .join(" ")
          : undefined,
      })
    } catch (error) {
      toast({
        type: "error",
        title: error instanceof Error ? error.message : actionErrorLabel,
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <BottomBar
        selectedCount={selectedCount}
        selectedLabel={selectedLabel}
        deselectLabel={deselectLabel}
        onDeselect={onDeselect}
      >
        {actions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button size="sm" variant="outline" disabled={isPending}>
                  {actionLabel}
                  <ChevronDown aria-hidden="true" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {actions.map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  disabled={isPending}
                  onClick={() => void execute(action.id)}
                >
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {deleteLabel && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 aria-hidden="true" />
            {deleteLabel}
          </Button>
        )}
        {children}
      </BottomBar>

      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          if (!isPending) {
            setIsDeleteOpen(open)
            if (!open) setConfirmation("")
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDescription.replace("{count}", String(selectedCount))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2">
            <label htmlFor="bulk-delete-confirm" className="text-sm">
              {deletePrompt.replace("{keyword}", confirmationKeyword)}
            </label>
            <Input
              id="bulk-delete-confirm"
              autoComplete="off"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending || confirmation !== confirmationKeyword}
              onClick={(event) => {
                event.preventDefault()
                void execute("delete")
              }}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                confirmLabel
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
