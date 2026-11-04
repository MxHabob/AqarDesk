import type { Metadata } from "next"
import { SupportForm } from "@/components/support-form"

export const metadata: Metadata = {
  title: "Support | AqarDesk",
  robots: { index: false, follow: false },
}

export default function AccountSupportPage() {
  return (
    <section className="max-w-[450px]">
      <SupportForm />
    </section>
  )
}
