import { Testimonials } from "@/components/marketing/testimonials"
import {
  createPageMetadata,
  getMarketingPageCopy,
} from "@/lib/marketing/metadata"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return createPageMetadata({
    ...getMarketingPageCopy("testimonials", locale),
    locale,
    path: "/testimonials",
    noindex: true,
  })
}

export default function Page() {
  return <Testimonials />
}
