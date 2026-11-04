import {
  ArrowUpLeft,
  ArrowUpRight,
  Building2,
  DraftingCompass,
  House,
  PartyPopper,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { createPageMetadata } from "@/lib/marketing/metadata"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("site")

  return createPageMetadata({
    title: t("openingOffer"),
    description: t("openingOfferDescription"),
    locale,
    path: "/updates/opening-offer",
  })
}

export default async function OpeningOfferPage({ params }: Props) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("site")
  const featuredServices = [
    {
      href: "/services/sale",
      Icon: House,
      title: t("serviceCopy.sale.title"),
      description: t("serviceCopy.sale.description"),
    },
    {
      href: "/services/rent",
      Icon: Building2,
      title: t("serviceCopy.rent.title"),
      description: t("serviceCopy.rent.description"),
    },
    {
      href: "/services/engineering-design",
      Icon: DraftingCompass,
      title: t("serviceCopy.engineeringDesign.title"),
      description: t("serviceCopy.engineeringDesign.description"),
    },
  ]

  return (
    <article className="mx-auto max-w-6xl py-8 sm:py-12 lg:py-16">
      <header className="relative isolate overflow-hidden border border-border bg-secondary">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 end-0 hidden w-2/5 border-s border-border opacity-70 lg:block"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--border) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div className="relative max-w-3xl px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <PartyPopper aria-hidden className="size-4" />
            {t("openingOffer")}
          </p>
          <h1 className="mt-6 max-w-2xl font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("openingOfferTitle")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            {t("openingOfferDescription")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center gap-2 bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
              href="/listings"
            >
              {t("browseListings")}
              <ArrowUpRight aria-hidden className="size-4 rtl:hidden" />
              <ArrowUpLeft aria-hidden className="hidden size-4 rtl:block" />
            </Link>
            <Link
              className="inline-flex min-h-11 items-center border border-border px-5 text-sm font-medium text-foreground transition-colors hover:border-foreground/30"
              href="/services"
            >
              {t("servicesEyebrow")}
            </Link>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="opening-offer-services-title"
        className="mt-12 sm:mt-16 lg:mt-20"
      >
        <div className="mb-5 border-b border-border pb-5 sm:mb-6">
          <h2
            className="font-serif text-2xl text-foreground sm:text-3xl"
            id="opening-offer-services-title"
          >
            {t("openingOfferSectionTitle")}
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            {t("openingOfferSectionDescription")}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredServices.map(({ href, Icon, title, description }) => (
            <Link
              className="group border border-border bg-background p-6 transition-colors hover:border-foreground/30 sm:p-8"
              href={href}
              key={href}
            >
              <span className="flex size-11 items-center justify-center border border-border bg-secondary text-muted-foreground transition-colors group-hover:text-foreground">
                <Icon aria-hidden className="size-5" />
              </span>
              <h3 className="mt-6 font-serif text-xl text-foreground">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  )
}
