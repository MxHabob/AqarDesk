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
import {
  useOfficeSettingsMutation,
  useOfficeSettingsQuery,
} from "@/hooks/use-office-settings"
import { useZodForm } from "@/hooks/use-zod-form"

const formSchema = z.object({
  email: z.string().email(),
})

export function CompanyEmail() {
  const { data } = useOfficeSettingsQuery()
  const updateTeamMutation = useOfficeSettingsMutation()

  const form = useZodForm(formSchema, {
    defaultValues: {
      email: data?.email ?? "",
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    updateTeamMutation.mutate(data)
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Company email</CardTitle>
            <CardDescription>
              This is the email address that will be used to receive emails from
              AqarDesk.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="max-w-[300px]">
                  <FormControl>
                    <Input {...field} placeholder="Email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-end">
            <SubmitButton
              isSubmitting={updateTeamMutation.isPending}
              disabled={updateTeamMutation.isPending}
            >
              Save
            </SubmitButton>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
