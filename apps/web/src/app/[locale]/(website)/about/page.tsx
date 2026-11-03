import {
  createPageMetadata,
  getMarketingPageCopy,
} from "@/lib/marketing/metadata"
import type { AppLocale } from "@/locales/config"

type Props = { params: Promise<{ locale: AppLocale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return createPageMetadata({
    ...getMarketingPageCopy("about", locale),
    locale,
    path: "/about",
  })
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const copy = getMarketingPageCopy("about", locale)

  return (
    <article className="mx-auto max-w-3xl space-y-5 py-12 sm:py-16">
      <h1 className="font-serif text-3xl text-foreground sm:text-4xl">
        {copy.title}
      </h1>
      <p className="text-base leading-8 text-muted-foreground">
        {copy.description}
      </p>
    </article>
  )
}
