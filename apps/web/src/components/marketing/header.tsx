"use client"

import { cn } from "@aqardesk/ui/cn"
import { Icons } from "@aqardesk/ui/icons"
import { motion } from "motion/react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { marketingServices } from "@/lib/marketing/services"
import { useScopedI18n } from "@/locales/client"
import { MarketingAccountMenu } from "./account-menu"
import { HeaderPreferences } from "./header-preferences"
import { ServicesFeaturedPreview } from "./services-featured-preview"

interface HeaderProps {
  transparent?: boolean
  hideMenuItems?: boolean
  locale: string
  countryCode: string
  listingPreviews: Array<{
    id: string
    title: string
    photo: { url: string; altText: string | null } | null
  }>
  quotes: Array<{
    name: string
    title: string
    country: string
    content: string
  }>
  featuredLabel: string
  quotesLabel: string
  demoNotice: string
  user?: {
    name: string
    email: string
    image: string | null
  } | null
  roleDestination?: string | null
}

export function Header({
  transparent = false,
  hideMenuItems = false,
  locale,
  countryCode,
  listingPreviews,
  quotes,
  featuredLabel,
  quotesLabel,
  demoNotice,
  user = null,
  roleDestination = null,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false)
  const servicesCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const t = useScopedI18n("site")

  useEffect(
    () => () => {
      if (servicesCloseTimeoutRef.current) {
        clearTimeout(servicesCloseTimeoutRef.current)
      }
    },
    []
  )

  return (
    <>
      <button
        aria-label={t("closeServicesMenu")}
        className={cn(
          "fixed inset-0 z-40 border-0 bg-black/40 p-0 transition-opacity duration-150",
          isServicesOpen
            ? "visible opacity-100"
            : "pointer-events-none invisible opacity-0"
        )}
        onClick={() => setIsServicesOpen(false)}
        type="button"
      />

      <nav
        className="fixed inset-x-0 top-9 z-50 w-full"
        onMouseEnter={() => {
          if (servicesCloseTimeoutRef.current) {
            clearTimeout(servicesCloseTimeoutRef.current)
            servicesCloseTimeoutRef.current = null
          }
        }}
        onMouseLeave={() => {
          servicesCloseTimeoutRef.current = setTimeout(() => {
            servicesCloseTimeoutRef.current = null
            setIsServicesOpen(false)
          }, 180)
        }}
      >
        <div
          className={cn(
            "relative flex items-center justify-between px-4 py-3 sm:px-4 md:px-4 lg:px-4 xl:gap-6 xl:px-6 xl:py-4 2xl:px-8",
            isMenuOpen && "border-b border-border",
            !transparent && "bg-background-semi-transparent backdrop-blur-md",
            !transparent && isServicesOpen && "xl:bg-background"
          )}
        >
          <Link
            aria-label={t("homeLinkLabel")}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            href="/"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="size-9">
              <Icons.LogoSmall className="size-full text-foreground" />
            </span>
            <span className="max-w-40 truncate font-sans text-base text-foreground xl:hidden sm:max-w-none">
              {t("officeName")}
            </span>
          </Link>

          {!hideMenuItems && (
            <div className="hidden items-center gap-6 xl:flex">
              <div className="relative -mx-3 -my-2">
                <button
                  aria-expanded={isServicesOpen}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setIsServicesOpen(true)}
                  onMouseEnter={() => {
                    if (servicesCloseTimeoutRef.current) {
                      clearTimeout(servicesCloseTimeoutRef.current)
                      servicesCloseTimeoutRef.current = null
                    }
                    setIsServicesOpen(true)
                  }}
                  type="button"
                >
                  {t("services")}
                  <Icons.ArrowDropDown
                    className={cn(
                      "size-4 transition-transform duration-200",
                      isServicesOpen && "rotate-180"
                    )}
                  />
                </button>
              </div>

              <Link
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                href="/about"
              >
                {t("about")}
              </Link>
              <Link
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                href="/portfolio"
              >
                {t("portfolio")}
              </Link>

              <HeaderPreferences
                countryCode={countryCode}
                idPrefix="desktop"
                locale={locale}
              />
              <div className="border-s border-border ps-4">
                {user ? (
                  <MarketingAccountMenu
                    roleDestination={roleDestination}
                    user={user}
                  />
                ) : (
                  <Link
                    className="text-sm text-primary transition-colors hover:text-primary/80"
                    href="/login"
                  >
                    {t("login")}
                  </Link>
                )}
              </div>
            </div>
          )}

          {!hideMenuItems && (
            <div className="flex items-center gap-2 xl:hidden">
              <button
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? t("closeMenu") : t("openMenu")}
                className="relative flex min-h-11 min-w-11 items-center justify-end p-2 text-primary"
                onClick={() => setIsMenuOpen((open) => !open)}
                type="button"
              >
                <span className="relative flex size-5 items-center justify-center">
                  <motion.span
                    animate={{
                      rotate: isMenuOpen ? 45 : 0,
                      y: isMenuOpen ? 0 : -4.5,
                    }}
                    className="absolute h-[1.5px] w-4 bg-current"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                  <motion.span
                    animate={{ opacity: isMenuOpen ? 0 : 1 }}
                    className="absolute h-[1.5px] w-4 bg-current"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                  <motion.span
                    animate={{
                      rotate: isMenuOpen ? -45 : 0,
                      y: isMenuOpen ? 0 : 4.5,
                    }}
                    className="absolute h-[1.5px] w-4 bg-current"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                </span>
              </button>
              <HeaderPreferences
                countryCode={countryCode}
                idPrefix="mobile"
                locale={locale}
              />
              {user ? (
                <MarketingAccountMenu
                  roleDestination={roleDestination}
                  user={user}
                />
              ) : (
                <Link
                  className="text-sm text-primary transition-colors hover:text-primary/80"
                  href="/login"
                >
                  {t("login")}
                </Link>
              )}
            </div>
          )}
        </div>
        <div
          aria-hidden={!isServicesOpen}
          className={cn(
            "absolute inset-x-0 top-full z-50 overflow-hidden border-y border-border bg-background shadow-lg",
            !isServicesOpen && "pointer-events-none invisible"
          )}
        >
          <div className="p-6 xl:p-8 2xl:p-10">
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5 xl:gap-6">
              <div className="min-w-0 lg:col-span-3">
                <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                  {marketingServices.map((service) => (
                    <Link
                      className="group flex items-center py-2 transition-colors duration-200 hover:bg-secondary"
                      href={`/services/${service.slug}`}
                      key={service.slug}
                      onClick={() => setIsServicesOpen(false)}
                    >
                      <span className="flex flex-col ps-2">
                        <span className="mb-1 font-sans text-sm text-foreground">
                          {t(`serviceCopy.${service.copyKey}.title`)}
                        </span>
                        <span className="line-clamp-1 font-sans text-[11px] text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                          {t(`serviceCopy.${service.copyKey}.summary`)}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex min-w-0 justify-end lg:col-span-2">
                <ServicesFeaturedPreview
                  className="h-[277px] w-full max-w-[400px] lg:min-h-0"
                  demoNotice={demoNotice}
                  featuredLabel={featuredLabel}
                  isOpen={isServicesOpen}
                  listings={listingPreviews}
                  locale={locale}
                  onClick={() => setIsServicesOpen(false)}
                  quotes={quotes}
                  quotesLabel={quotesLabel}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {isMenuOpen && !hideMenuItems && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-background px-6 pb-10 pt-28 text-start xl:hidden">
          <div className="flex flex-col space-y-6">
            <section className="flex flex-col">
              <button
                aria-expanded={isMobileServicesOpen}
                className="flex items-center justify-between py-2 text-2xl text-primary"
                onClick={() => setIsMobileServicesOpen((open) => !open)}
                type="button"
              >
                <span>{t("services")}</span>
                <Icons.ArrowDropDown
                  className={cn(
                    "size-6 transition-transform duration-200",
                    isMobileServicesOpen && "rotate-180"
                  )}
                />
              </button>
              {isMobileServicesOpen && (
                <>
                  <div className="my-2 h-px w-full border-t border-border" />
                  <div className="flex flex-col space-y-4 pt-2">
                    <Link
                      className="text-lg text-muted-foreground"
                      href="/services"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("allServices")}
                    </Link>
                    {marketingServices.map((service) => (
                      <Link
                        className="text-lg text-muted-foreground"
                        href={`/services/${service.slug}`}
                        key={service.slug}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t(`serviceCopy.${service.copyKey}.title`)}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </section>

            <Link
              className="py-2 text-2xl text-primary"
              href="/about"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("about")}
            </Link>
            <Link
              className="py-2 text-2xl text-primary"
              href="/portfolio"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("portfolio")}
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
