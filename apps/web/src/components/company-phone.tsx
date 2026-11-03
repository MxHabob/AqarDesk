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
  phone: z.string().trim().max(40),
})

export function CompanyPhone() {
  const { data } = useOfficeSettingsQuery()
  const updateTeamMutation = useOfficeSettingsMutation()

  const form = useZodForm(formSchema, {
    defaultValues: {
      phone: data?.phone ?? "",
    },
  })

  const onSubmit = form.handleSubmit(({ phone }) => {
    updateTeamMutation.mutate({ phone: phone || null })
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Office phone number</CardTitle>
            <CardDescription>
              This number will be used for WhatsApp contact from your public
              listings. Use an international number or a local Saudi number.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      className="max-w-[300px]"
                      autoComplete="tel"
                      placeholder="+966 5X XXX XXXX"
                      maxLength={40}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-end">
            <SubmitButton
              type="submit"
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
