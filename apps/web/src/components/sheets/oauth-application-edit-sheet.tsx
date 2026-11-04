"use client"

import { Button } from "@aqardesk/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@aqardesk/ui/dropdown-menu"
import { Icons } from "@aqardesk/ui/icons"
import { ScrollArea } from "@aqardesk/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@aqardesk/ui/sheet"
import { Skeleton } from "@aqardesk/ui/skeleton"
import { useToast } from "@aqardesk/ui/use-toast"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useCopyToClipboard } from "usehooks-ts"
import { OAuthApplicationForm } from "@/components/forms/oauth-application-form"
import { DeleteOAuthApplicationModal } from "@/components/modals/delete-oauth-application-modal"
import { OAuthApplicationStatusBadge } from "@/components/oauth-application-status-badge"
import { useOAuthApplicationParams } from "@/hooks/use-oauth-application-params"
import { useTRPC } from "@/trpc/client"

export function OAuthApplicationEditSheet() {
  const trpc = useTRPC()
  const { toast } = useToast()
  const [, copy] = useCopyToClipboard()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const queryClient = useQueryClient()
  const { setParams, applicationId, editApplication } =
    useOAuthApplicationParams()

  const isOpen = Boolean(applicationId && editApplication)

  const {
    data: application,
    isLoading: isLoadingApplication,
    error: applicationError,
  } = useQuery(
    trpc.oauthApplications.get.queryOptions(
      { id: applicationId! },
      {
        enabled: isOpen,
      }
    )
  )

  const submitForReviewMutation = useMutation(
    trpc.oauthApplications.updateApprovalStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.oauthApplications.list.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.oauthApplications.get.queryKey(),
        })
        toast({
          title: "Submitted for review",
          description:
            "Your application has been submitted for review and will be visible once approved.",
          variant: "success",
        })
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to submit for review",
        })
      },
    })
  )

  const makeDraftMutation = useMutation(
    trpc.oauthApplications.updateApprovalStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.oauthApplications.list.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.oauthApplications.get.queryKey(),
        })
        toast({
          title: "Application moved to draft",
          description:
            "Your application has been moved back to draft status and removed from review.",
          variant: "success",
        })
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to move to draft",
        })
      },
    })
  )

  const handleCopyClientId = () => {
    if (application?.clientId) {
      copy(application.clientId)
      toast({
        title: "Client ID copied to clipboard",
        variant: "success",
      })
    }
  }

  const handleSubmitForReview = () => {
    if (applicationId) {
      submitForReviewMutation.mutate({
        id: applicationId,
        status: "pending",
      })
    }
  }

  const handleMakeDraft = () => {
    if (applicationId) {
      makeDraftMutation.mutate({
        id: applicationId,
        status: "draft",
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={() => setParams(null)}>
      <SheetContent showCloseButton={false}>
        <SheetHeader className="mb-6 flex-row items-center justify-between">
          <SheetTitle className="text-xl font-normal">
            Edit OAuth Application
          </SheetTitle>

          <div className="flex items-center gap-2">
            {application?.status && (
              <OAuthApplicationStatusBadge status={application.status} />
            )}

            {application && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button">
                    <Icons.MoreVertical className="size-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={10} align="end">
                  <DropdownMenuItem onClick={handleCopyClientId}>
                    Copy Client ID
                  </DropdownMenuItem>
                  {application?.status === "draft" && (
                    <DropdownMenuItem
                      onClick={handleSubmitForReview}
                      disabled={submitForReviewMutation.isPending}
                    >
                      {submitForReviewMutation.isPending
                        ? "Submitting..."
                        : "Submit for review"}
                    </DropdownMenuItem>
                  )}
                  {application?.status === "pending" && (
                    <DropdownMenuItem
                      onClick={handleMakeDraft}
                      disabled={makeDraftMutation.isPending}
                    >
                      {makeDraftMutation.isPending
                        ? "Cancelling review..."
                        : "Cancel review"}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="إغلاق"
              onClick={() => setParams(null)}
            >
              <Icons.Close className="size-5" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-full p-0 pb-10" hideScrollbar>
          {applicationError ? (
            <p className="text-sm text-destructive" role="alert">
              {applicationError instanceof Error
                ? applicationError.message
                : "Failed to load the application."}
            </p>
          ) : isLoadingApplication ? (
            <div
              role="status"
              aria-label="Loading application form"
              aria-busy="true"
              className="space-y-6 p-1"
            >
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : application ? (
            <OAuthApplicationForm data={application} key={application.id} />
          ) : (
            <p className="text-sm text-destructive" role="alert">
              Application not found.
            </p>
          )}
        </ScrollArea>
      </SheetContent>

      <DeleteOAuthApplicationModal
        applicationId={applicationId!}
        applicationName={application?.name || ""}
        isOpen={showDeleteModal}
        onOpenChange={setShowDeleteModal}
      />
    </Sheet>
  )
}
