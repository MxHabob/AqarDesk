import {
  ArrowUpLeft,
  ArrowUpRight,
  Building2,
  Compass,
  MessageCircle,
} from "lucide-react"
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
    <article className="mx-auto max-w-6xl py-10 sm:py-16 lg:py-20">
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
            <Building2 aria-hidden className="size-4" />
            {t("aboutEyebrow")}
          </p>
          <h1 className="mt-6 max-w-2xl font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("aboutTitle")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            {t("aboutDescription")}
          </p>
          <Link
            className="mt-8 inline-flex min-h-11 items-center gap-2 bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            href="/listings"
          >
            {t("browseListings")}
            <ArrowUpRight aria-hidden className="size-4 rtl:hidden" />
            <ArrowUpLeft aria-hidden className="hidden size-4 rtl:block" />
          </Link>
        </div>
      </header>

      <section
        aria-label={t("aboutHowTitle")}
        className="mt-4 grid gap-4 md:grid-cols-2"
      >
        <div className="group border border-border bg-background p-6 transition-colors hover:border-foreground/30 sm:p-8">
          <span className="flex size-11 items-center justify-center border border-border bg-secondary text-muted-foreground">
            <MessageCircle aria-hidden className="size-5" />
          </span>
          <h2 className="mt-6 font-serif text-2xl text-foreground">
            {t("aboutApproachTitle")}
          </h2>
          <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
            {t("aboutApproachDescription")}
          </p>
        </div>
        <div className="group border border-border bg-background p-6 transition-colors hover:border-foreground/30 sm:p-8">
          <span className="flex size-11 items-center justify-center border border-border bg-secondary text-muted-foreground">
            <Compass aria-hidden className="size-5" />
          </span>
          <h2 className="mt-6 font-serif text-2xl text-foreground">
            {t("aboutHowTitle")}
          </h2>
          <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
            {t("aboutHowDescription")}
          </p>
        </div>
      </section>

      <section
        aria-labelledby="property-journey-title"
        className="mt-16 sm:mt-20"
      >
        <div className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <h2
            className="font-serif text-2xl text-foreground sm:text-3xl"
            id="property-journey-title"
          >
            {t("aboutStepsTitle")}
          </h2>
        </div>
        <ol className="grid md:grid-cols-3">
          {[
            {
              number: "01",
              title: t("browseListings"),
              description: t("aboutStepBrowse"),
            },
            {
              number: "02",
              title: t("viewListing"),
              description: t("aboutStepDetails"),
            },
            {
              number: "03",
              title: t("contactServiceTitle"),
              description: t("aboutStepContact"),
            },
          ].map((step) => (
            <li
              className="border-b border-border py-6 md:border-b-0 md:py-8 md:pe-6 md:ps-6 md:first:ps-0 md:last:pe-0 md:[&:not(:first-child)]:border-s"
              key={step.number}
            >
              <span className="font-mono text-xs tracking-widest text-muted-foreground">
                {step.number}
              </span>
              <h3 className="mt-4 font-serif text-xl text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </article>
  )
}
