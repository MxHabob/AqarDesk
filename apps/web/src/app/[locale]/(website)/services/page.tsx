import {
  ArrowUpLeft,
  ArrowUpRight,
  Building2,
  ChartNoAxesCombined,
  KeyRound,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import {
  createPageMetadata,
  getMarketingPageCopy,
} from "@/lib/marketing/metadata"
import { getScopedI18n } from "@/locales/server"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return createPageMetadata({
    ...getMarketingPageCopy("services", locale),
    locale,
    path: "/services",
  })
}

export default async function ServicesPage() {
  const t = await getScopedI18n("site")
  const services = [
    {
      number: "01",
      icon: Building2,
      title: t("saleServiceTitle"),
      description: t("saleServiceDescription"),
      href: "/listings?listingType=sale",
    },
    {
      number: "02",
      icon: KeyRound,
      title: t("rentalServiceTitle"),
      description: t("rentalServiceDescription"),
      href: "/listings?listingType=rent",
    },
    {
      number: "03",
      icon: ChartNoAxesCombined,
      title: t("investmentServiceTitle"),
      description: t("investmentServiceDescription"),
      href: "/listings",
    },
  ]

  return (
    <article className="mx-auto max-w-6xl py-10 sm:py-16 lg:py-20">
      <header className="grid gap-8 border-b border-border pb-8 sm:pb-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("servicesEyebrow")}
          </p>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("servicesTitle")}
          </h1>
        </div>
        <p className="max-w-xl text-base leading-8 text-muted-foreground lg:justify-self-end">
          {t("servicesDescription")}
        </p>
      </header>

      <section
        aria-label={t("servicesTitle")}
        className="mt-4 grid gap-4 sm:grid-cols-2"
      >
        {services.map((service) => (
          <Link
            className="group relative flex min-h-64 flex-col overflow-hidden border border-border bg-background p-6 transition-colors hover:border-foreground/30 hover:bg-secondary sm:p-8"
            href={service.href}
            key={service.number}
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex size-12 items-center justify-center border border-border bg-secondary text-muted-foreground transition-colors group-hover:bg-background">
                <service.icon aria-hidden className="size-5" />
              </span>
              <span className="font-mono text-xs tracking-widest text-muted-foreground">
                {service.number}
              </span>
            </div>
            <h2 className="mt-8 font-serif text-2xl text-foreground">
              {service.title}
            </h2>
            <p className="mt-3 flex-1 leading-7 text-muted-foreground">
              {service.description}
            </p>
            <span className="mt-7 inline-flex items-center gap-2 border-t border-border pt-4 text-sm font-medium text-foreground">
              {t("exploreService")}
              <ArrowUpRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:hidden"
              />
              <ArrowUpLeft
                aria-hidden
                className="hidden size-4 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 rtl:block"
              />
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-4 flex flex-col gap-6 border border-border bg-secondary p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground">{t("featuredTitle")}</p>
          <h2 className="mt-2 font-serif text-2xl text-foreground">
            {t("featuredDescription")}
          </h2>
        </div>
        <Link
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          href="/listings"
        >
          {t("browseListings")}
          <ArrowUpRight aria-hidden className="size-4 rtl:hidden" />
          <ArrowUpLeft aria-hidden className="hidden size-4 rtl:block" />
        </Link>
      </section>
    </article>
  )
}
