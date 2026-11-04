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
    ...getMarketingPageCopy("privacy", locale),
    locale,
    path: "/policy",
  })
}

export default async function PrivacyPage({
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
          {t("privacyTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("updated")}</p>
        <p className="leading-relaxed text-muted-foreground">
          {t("privacyIntro")}
        </p>
      </header>

      <div className="space-y-7">
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("privacyInfoTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("privacyInfo")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("privacyUseTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("privacyUse")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("privacySharingTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("privacySharing")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("privacyTransfersTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("privacyTransfers")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("privacyCookiesTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("privacyCookies")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("privacyRetentionTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("privacyRetention")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("privacySecurityTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("privacySecurity")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("privacyRightsTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("privacyRights")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("privacyChildrenTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("privacyChildren")}
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-foreground">
            {t("privacyChangesTitle")}
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {t("privacyChanges")}
          </p>
        </section>
        <section className="space-y-2 border-t border-border pt-5">
          <p className="leading-relaxed text-muted-foreground">
            {t("privacyContact")}{" "}
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
