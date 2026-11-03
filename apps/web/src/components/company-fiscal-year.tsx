"use client"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@aqardesk/ui/form"
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
import { SelectFiscalMonth } from "./select-fiscal-month"

const formSchema = z.object({
  fiscalYearStartMonth: z.number().int().min(1).max(12).nullable(),
})

export function CompanyFiscalYear() {
  const { data } = useOfficeSettingsQuery()
  const updateTeamMutation = useOfficeSettingsMutation()

  const form = useZodForm(formSchema, {
    defaultValues: {
      fiscalYearStartMonth: data?.fiscalYearStartMonth ?? null,
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    updateTeamMutation.mutate({
      fiscalYearStartMonth: data.fiscalYearStartMonth ?? 1,
    })
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Fiscal year</CardTitle>
            <CardDescription>
              Set when your fiscal year begins. This determines the default date
              ranges for all reports throughout the application.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FormField
              control={form.control}
              name="fiscalYearStartMonth"
              render={({ field }) => (
                <FormItem className="max-w-[300px]">
                  <FormControl>
                    <SelectFiscalMonth {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-end">
            <SubmitButton
              type="submit"
              disabled={updateTeamMutation.isPending || !form.formState.isDirty}
              isSubmitting={updateTeamMutation.isPending}
            >
              Save
            </SubmitButton>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
