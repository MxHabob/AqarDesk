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
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { archiveActiveTeamAction } from "@/actions/teams"

export function DeleteTeam() {
  const [value, setValue] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const deleteTeamMutation = useMutation({
    mutationFn: archiveActiveTeamAction,
    onSuccess: async () => {
      router.push("/teams")
    },
    onError: (error) => toast({ variant: "error", title: error.message }),
  })

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle>Archive team</CardTitle>
        <CardDescription>
          Archive this team so it no longer appears in your active team list.
          Existing property and listing records are not deleted.
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
              Archive
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  <p>
                    The team will be archived. Existing property and listing
                    records will remain available.
                  </p>
                </div>
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
                onClick={() => {
                  deleteTeamMutation.mutate()
                }}
                disabled={value !== "DELETE" || deleteTeamMutation.isPending}
              >
                {deleteTeamMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirm"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
