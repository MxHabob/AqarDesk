import Link from "next/link"
import {
  createPageMetadata,
  getMarketingPageCopy,
} from "@/lib/marketing/metadata"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return createPageMetadata({
    ...getMarketingPageCopy("terms", locale),
    locale,
    path: "/terms",
  })
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("legal")

  return (
    <article className="mx-auto min-h-screen max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-8 space-y-3">
        <h1 className="font-serif text-2xl text-foreground sm:text-3xl">
          {t("termsTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("updated")}</p>
        <p className="leading-relaxed text-muted-foreground">
          {t("termsIntro")}
        </p>
      </header>

      <div className="space-y-7">
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("termsEligibilityTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("termsEligibility")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("termsListingsTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("termsListings")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("termsRoleTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("termsRole")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("termsFeesTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("termsFees")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("termsAccountsTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("termsAccounts")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("termsContentTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("termsContent")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("termsOwnershipTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("termsOwnership")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("termsThirdPartiesTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("termsThirdParties")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("termsLiabilityTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("termsLiability")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("termsSuspensionTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("termsSuspension")}
          </p>
        </section>
        <section className="space-y-2 border-t border-border pt-5">
          <p className="leading-relaxed text-muted-foreground">
            {t("termsChanges")}{" "}
            <Link
              href="/account/support"
              className="text-foreground underline underline-offset-4"
            >
              {t("supportLink")}
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">{t("officeAddress")}</p>
        </section>
      </div>
    </article>
  )
}
