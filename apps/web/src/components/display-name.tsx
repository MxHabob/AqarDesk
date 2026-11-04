"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@aqardesk/ui/form"
import { Input } from "@aqardesk/ui/input"
import { SubmitButton } from "@aqardesk/ui/submit-button"
import { z } from "zod/v3"
import { useUserMutation, useUserQuery } from "@/hooks/use-user"
import { useZodForm } from "@/hooks/use-zod-form"
import { useI18n } from "@/locales/client"

const formSchema = z.object({
  fullName: z.string().min(1).max(32).optional(),
})

export function DisplayName() {
  const t = useI18n()
  const { data: user } = useUserQuery()
  const updateUserMutation = useUserMutation()

  const form = useZodForm(formSchema, {
    defaultValues: {
      fullName: user?.fullName ?? undefined,
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    updateUserMutation.mutate({
      fullName: data?.fullName,
    })
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="normal-case tracking-normal">
              {t("accountSettings.displayNameTitle")}
            </CardTitle>
            <CardDescription>
              {t("accountSettings.displayNameDescription")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full max-w-[300px]"
                      autoComplete="off"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      maxLength={32}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-muted-foreground">
              {t("accountSettings.displayNameLimit")}
            </div>
            <SubmitButton
              type="submit"
              disabled={updateUserMutation.isPending}
              isSubmitting={updateUserMutation.isPending}
              className="w-full sm:w-auto"
            >
              {t("accountSettings.save")}
            </SubmitButton>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
