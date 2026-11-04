"use client"

import { Button } from "@aqardesk/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@aqardesk/ui/form"
import { Input } from "@aqardesk/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aqardesk/ui/select"
import { Textarea } from "@aqardesk/ui/textarea"
import { useToast } from "@aqardesk/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { z } from "zod/v3"
import { sendSupportAction } from "@/actions/send-support-action"
import { useZodForm } from "@/hooks/use-zod-form"
import { useI18n } from "@/locales/client"

const formSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  priority: z.enum(["low", "normal", "high", "urgent", "0", "1", "2", "3"]),
  type: z.string().trim().min(1).max(80),
  message: z.string().trim().min(10).max(5000),
  url: z.string().optional(),
})

const supportSections = [
  ["Overview", "serviceOverview"],
  ["Reports", "serviceReports"],
  ["Properties", "serviceProperties"],
  ["Listings", "serviceListings"],
  ["Owners", "serviceOwners"],
  ["Customers", "serviceCustomers"],
  ["Invoices", "serviceInvoices"],
  ["Teams", "serviceTeams"],
  ["Office settings", "serviceOfficeSettings"],
  ["Account and security", "serviceAccount"],
  ["Other", "serviceOther"],
] as const

export function SupportForm() {
  const t = useI18n()
  const { toast } = useToast()

  const form = useZodForm(formSchema, {
    defaultValues: {
      subject: undefined,
      type: undefined,
      priority: undefined,
      message: undefined,
    },
  })

  const sendSupport = useAction(sendSupportAction, {
    onSuccess: () => {
      toast({
        timeout: 2500,
        title: t("accountSettings.supportSent"),
        type: "success",
      })

      form.reset()
    },
    onError: () => {
      toast({
        timeout: 3500,
        type: "error",
        title: t("accountSettings.supportError"),
      })
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(sendSupport.execute)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("accountSettings.supportSubject")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("accountSettings.supportSubjectPlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-x-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("accountSettings.supportSection")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          "accountSettings.supportSectionPlaceholder"
                        )}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {supportSections.map(([value, translationKey]) => (
                      <SelectItem key={value} value={value}>
                        {t(`accountSettings.${translationKey}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("accountSettings.supportSeverity")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          "accountSettings.supportSeverityPlaceholder"
                        )}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">
                      {t("accountSettings.severityLow")}
                    </SelectItem>
                    <SelectItem value="normal">
                      {t("accountSettings.severityNormal")}
                    </SelectItem>
                    <SelectItem value="high">
                      {t("accountSettings.severityHigh")}
                    </SelectItem>
                    <SelectItem value="urgent">
                      {t("accountSettings.severityUrgent")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("accountSettings.supportMessage")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("accountSettings.supportMessagePlaceholder")}
                  className="resize-none min-h-[150px]"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={
            sendSupport.status === "executing" || !form.formState.isValid
          }
        >
          {sendSupport.status === "executing" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("accountSettings.supportSubmit")
          )}
        </Button>
      </form>
    </Form>
  )
}
