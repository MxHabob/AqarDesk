"use client"

import { Button } from "@aqardesk/ui/button"
import { Icons } from "@aqardesk/ui/icons"
import { ScrollArea } from "@aqardesk/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@aqardesk/ui/sheet"
import { OAuthApplicationForm } from "@/components/forms/oauth-application-form"
import { useOAuthApplicationParams } from "@/hooks/use-oauth-application-params"

export function OAuthApplicationCreateSheet() {
  const { setParams, createApplication } = useOAuthApplicationParams()

  const isOpen = Boolean(createApplication)

  return (
    <Sheet open={isOpen} onOpenChange={() => setParams(null)}>
      <SheetContent showCloseButton={false}>
        <SheetHeader className="mb-6 flex-row items-center justify-between">
          <SheetTitle className="text-xl font-normal">
            Create OAuth Application
          </SheetTitle>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="إغلاق"
            onClick={() => setParams(null)}
            className="hover:bg-transparent"
          >
            <Icons.Close className="size-5" />
          </Button>
        </SheetHeader>

        <ScrollArea className="h-full p-0 pb-10" hideScrollbar>
          <OAuthApplicationForm />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
