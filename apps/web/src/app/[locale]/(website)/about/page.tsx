import { ArrowUpLeft, ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import {
  createPageMetadata,
  getMarketingPageCopy,
} from "@/lib/marketing/metadata"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

type Props = { params: Promise<{ locale: string }> }

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
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("site")

  return (
    <article className="mx-auto flex min-h-[55svh] max-w-3xl flex-col items-center justify-center py-16 text-center sm:py-24">
      <Image
        alt={t("officeName")}
        className="h-auto w-16 sm:w-[72px]"
        height={323}
        priority
        src="/images/logo.svg"
        width={231}
      />
      <p className="mt-7 text-xs font-medium tracking-wide text-muted-foreground sm:text-sm">
        {t("aboutEyebrow")}
      </p>
      <h1 className="mt-3 max-w-2xl font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {t("aboutTitle")}
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
        {t("aboutDescription")}
      </p>
      <Link
        className="mt-7 inline-flex min-h-11 items-center gap-2 border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        href="/listings"
      >
        {t("browseListings")}
        <ArrowUpRight aria-hidden className="size-4 rtl:hidden" />
        <ArrowUpLeft aria-hidden className="hidden size-4 rtl:block" />
      </Link>
    </article>
  )
}
