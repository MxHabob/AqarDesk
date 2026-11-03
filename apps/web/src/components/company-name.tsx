"use client"

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
  SettingsCard as Card,
  SettingsCardContent as CardContent,
  SettingsCardDescription as CardDescription,
  SettingsCardFooter as CardFooter,
  SettingsCardHeader as CardHeader,
  SettingsCardTitle as CardTitle,
} from "@/components/settings-card"
import {
  useOfficeSettingsMutation,
  useOfficeSettingsQuery,
} from "@/hooks/use-office-settings"
import { useZodForm } from "@/hooks/use-zod-form"

const formSchema = z.object({
  name: z.string().min(2).max(32),
})

export function CompanyName() {
  const { data } = useOfficeSettingsQuery()
  const updateTeamMutation = useOfficeSettingsMutation()

  const form = useZodForm(formSchema, {
    defaultValues: {
      name: data?.name ?? "",
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
            <CardTitle>Company name</CardTitle>
            <CardDescription>
              This is your company's visible name within AqarDesk. For example,
              the name of your company or department.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      className="max-w-[300px]"
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

          <CardFooter className="flex justify-between">
            <div>Please use 32 characters at maximum.</div>
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
