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
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/card"
import { Input } from "@aqardesk/ui/input"
import { Label } from "@aqardesk/ui/label"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { deleteCurrentAccountAction } from "@/actions/delete-account"
import { redirectAfterAccountDeletion } from "@/actions/revalidate-action"
import { useI18n } from "@/locales/client"

export function DeleteAccount() {
  const t = useI18n()
  const [value, setValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const deleteUserMutation = useMutation({
    mutationFn: deleteCurrentAccountAction,
    onSuccess: async () => {
      await redirectAfterAccountDeletion()
    },
    onError: (error) => setErrorMessage(error.message),
  })

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="normal-case tracking-normal">
          {t("accountSettings.deleteTitle")}
        </CardTitle>
        <CardDescription>
          {t("accountSettings.deleteDescription")}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div />

        <AlertDialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) setValue("")
          }}
        >
          <Button
            type="button"
            variant="destructive"
            className="w-full text-muted hover:bg-destructive sm:w-auto"
            onClick={() => {
              setErrorMessage(null)
              setIsOpen(true)
            }}
          >
            {t("accountSettings.deleteButton")}
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="normal-case tracking-normal">
                {t("accountSettings.deleteConfirmTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("accountSettings.deleteConfirmDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex flex-col gap-2 mt-2">
              <Label htmlFor="confirm-delete">
                {t("accountSettings.deleteConfirmPrompt", {
                  keyword: t("accountSettings.deleteConfirmKeyword"),
                })}
              </Label>
              <Input
                id="confirm-delete"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              {errorMessage && (
                <p role="alert" className="text-sm text-destructive">
                  {errorMessage}
                </p>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteUserMutation.mutate()}
                disabled={value !== t("accountSettings.deleteConfirmKeyword")}
              >
                {deleteUserMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("accountSettings.continue")
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
