"use client"

import { useToast } from "@aqardesk/ui/use-toast"
import { SelectCurrency as SelectCurrencyBase } from "@/components/select-currency"
import {
  useOfficeSettingsMutation,
  useOfficeSettingsQuery,
} from "@/hooks/use-office-settings"

const currencies = [
  "SAR",
  "AED",
  "BHD",
  "KWD",
  "OMR",
  "QAR",
  "USD",
  "EUR",
  "GBP",
  "EGP",
  "JOD",
  "INR",
  "PKR",
]

export function SelectCurrency() {
  const { toast } = useToast()
  const { data: settings } = useOfficeSettingsQuery()
  const updateSettings = useOfficeSettingsMutation()

  const handleChange = (defaultCurrency: string) => {
    updateSettings.mutate(
      { defaultCurrency: defaultCurrency.toUpperCase() },
      {
        onSuccess: () => {
          toast({
            timeout: 3500,
            type: "success",
            title: "Office currency updated.",
          })
        },
        onError: (error) => {
          toast({
            timeout: 3500,
            type: "error",
            title: error.message,
          })
        },
      }
    )
  }

  return (
    <div className="w-[200px]">
      <SelectCurrencyBase
        onChange={handleChange}
        currencies={currencies}
        value={settings.defaultCurrency}
      />
    </div>
  )
}
