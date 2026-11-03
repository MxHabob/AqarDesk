"use client"

import { SheetContent } from "@aqardesk/ui/sheet"
import { useFormContext } from "react-hook-form"
import { Form } from "@/components/invoice/form"
import { InvoiceSuccess } from "@/components/invoice-success"
import { useInvoiceParams } from "@/hooks/use-invoice-params"

export function InvoiceContent() {
  const { invoiceType } = useInvoiceParams()
  const { watch } = useFormContext()
  const templateSize = watch("template.size")

  const size = templateSize === "a4" ? 650 : 740

  if (invoiceType === "success") {
    return (
      <SheetContent
        className="transition-[max-width] duration-300 ease-in-out"
        panelClassName="bg-[#fafaf9] dark:bg-[#0c0c0c]"
      >
        <InvoiceSuccess />
      </SheetContent>
    )
  }

  return (
    <SheetContent
      style={{ maxWidth: size }}
      className="transition-[max-width] duration-300 ease-in-out"
      panelClassName="bg-[#fafaf9] p-0 dark:bg-[#0c0c0c]"
    >
      <Form />
    </SheetContent>
  )
}
