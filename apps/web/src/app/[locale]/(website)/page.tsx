import { StartPage } from "@/components/marketing/startpage"
import {
  createPageMetadata,
  getMarketingPageCopy,
} from "@/lib/marketing/metadata"
import type { AppLocale } from "@/locales/config"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>
}) {
  const { locale } = await params
  const copy = getMarketingPageCopy("home", locale)
  return createPageMetadata({ ...copy, locale, path: "/" })
}

export default function Page() {
  return <StartPage />
}
