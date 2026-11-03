"use client"

import { authClient } from "@aqardesk/auth/client"
import { LogEvents } from "@aqardesk/events/events"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
import { useToast } from "@aqardesk/ui/use-toast"
import { useOpenPanel } from "@openpanel/nextjs"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { deleteCurrentAccountAction } from "@/actions/delete-account"
import { redirectAfterAccountDeletion } from "@/actions/revalidate-action"

export function DeleteAccount() {
  const { track } = useOpenPanel()
  const { toast } = useToast()

  const deleteUserMutation = useMutation({
    mutationFn: deleteCurrentAccountAction,
    onSuccess: async () => {
      track(LogEvents.AccountDeleted.name)
      await authClient.signOut()
      await redirectAfterAccountDeletion()
    },
    onError: (error) => toast({ variant: "error", title: error.message }),
  })

  const [value, setValue] = useState("")

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle>Delete account</CardTitle>
        <CardDescription>
          Permanently remove your AqarDesk account and sign-in data. This action
          cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <div />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="hover:bg-destructive text-muted"
            >
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex flex-col gap-2 mt-2">
              <Label htmlFor="confirm-delete">
                Type <span className="font-medium">DELETE</span> to confirm.
              </Label>
              <Input
                id="confirm-delete"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteUserMutation.mutate()}
                disabled={value !== "DELETE"}
              >
                {deleteUserMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Continue"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
