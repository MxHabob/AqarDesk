"use client"

import { cn } from "@aqardesk/ui/cn"
import { Icons } from "@aqardesk/ui/icons"
import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { marketingServices } from "@/lib/marketing/services"
import { MarketingAccountMenu } from "./account-menu"
import { HeaderPreferences } from "./header-preferences"

interface HeaderProps {
  transparent?: boolean
  hideMenuItems?: boolean
  locale: string
  countryCode: string
  listingPreviews: Array<{
    id: string
    title: string
    listingType: "sale" | "rent"
    location: string
    image: { url: string; altText: string | null } | null
  }>
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
  user = null,
  roleDestination = null,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(72)
  const headerRef = useRef<HTMLDivElement>(null)
  const isArabic = locale === "ar"
  const servicesLabel = isArabic ? "خدماتنا" : "Services"
  const aboutLabel = isArabic ? "من نحن" : "About us"
  const portfolioLabel = isArabic ? "ملف الأعمال" : "Portfolio"
  const signInLabel = isArabic ? "تسجيل الدخول" : "Sign in"

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const resizeObserver = new ResizeObserver(() => {
      setHeaderHeight(header.getBoundingClientRect().height)
    })
    resizeObserver.observe(header)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <>
      <button
        aria-label={isArabic ? "إغلاق قائمة الخدمات" : "Close services menu"}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-0 bg-black/40 p-0 transition-opacity duration-150",
          isServicesOpen
            ? "visible opacity-100"
            : "pointer-events-none invisible opacity-0"
        )}
        onClick={() => setIsServicesOpen(false)}
        style={{ top: headerHeight }}
        type="button"
      />

      <nav className="sticky inset-x-0 top-0 z-50 w-full">
        <div
          ref={headerRef}
          className={cn(
            "relative flex items-center justify-between gap-6 px-4 py-3 sm:px-4 md:px-4 lg:px-4 xl:px-6 xl:py-4 2xl:px-8",
            isMenuOpen && "border-b border-border",
            !transparent && "bg-background-semi-transparent backdrop-blur-md",
            !transparent && isServicesOpen && "xl:bg-background"
          )}
        >
          <Link
            aria-label="AqarDesk - Go to homepage"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            href="/"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="size-6">
              <Icons.LogoSmall className="size-full text-foreground" />
            </span>
            <span className="font-sans text-base text-foreground xl:hidden">
              AqarDesk
            </span>
          </Link>

          {!hideMenuItems && (
            <div className="hidden items-center gap-6 xl:flex">
              <div className="relative -mx-3 -my-2">
                <button
                  aria-expanded={isServicesOpen}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setIsServicesOpen(true)}
                  onMouseEnter={() => setIsServicesOpen(true)}
                  type="button"
                >
                  {servicesLabel}
                  <Icons.ArrowDropDown
                    className={cn(
                      "size-4 transition-transform duration-200",
                      isServicesOpen && "rotate-180"
                    )}
                  />
                </button>
                {isServicesOpen && (
                  <>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-full h-4"
                    />
                    <div
                      className="fixed inset-x-0 z-50 overflow-hidden border-y border-border bg-background shadow-lg"
                      style={{ top: headerHeight }}
                    >
                      <div className="p-6 xl:p-8 2xl:p-10">
                        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-4 xl:gap-6">
                          <div className="lg:col-span-2 lg:max-w-md xl:max-w-xl">
                            <div className="grid grid-cols-2 gap-x-4">
                              {[0, 1].map((column) => (
                                <div key={column}>
                                  {marketingServices
                                    .filter((_, index) => index % 2 === column)
                                    .map((service) => (
                                      <Link
                                        className="group flex items-center py-3 transition-colors duration-200 hover:bg-secondary"
                                        href={`/services/${service.slug}`}
                                        key={service.slug}
                                        onClick={() => setIsServicesOpen(false)}
                                      >
                                        <span className="flex flex-col ps-2">
                                          <span className="mb-1 font-sans text-base text-foreground">
                                            {
                                              service.title[
                                                isArabic ? "ar" : "en"
                                              ]
                                            }
                                          </span>
                                          <span className="font-sans text-xs text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                                            {
                                              service.description[
                                                isArabic ? "ar" : "en"
                                              ]
                                            }
                                          </span>
                                        </span>
                                      </Link>
                                    ))}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="lg:col-span-2 flex items-start justify-end gap-4">
                            {listingPreviews.slice(0, 2).map((listing) => (
                              <Link
                                className="group flex h-[277px] w-full max-w-[320px] shrink-0 flex-col overflow-hidden border border-border transition-all duration-200 hover:scale-[1.02] hover:border-foreground/20 hover:opacity-90 lg:w-[320px] lg:max-w-none xl:w-[350px] 2xl:w-[400px]"
                                href={`/listings/${listing.id}`}
                                key={listing.id}
                                onClick={() => setIsServicesOpen(false)}
                              >
                                <span className="relative flex-1 overflow-hidden bg-secondary">
                                  {listing.image ? (
                                    <Image
                                      alt={
                                        listing.image.altText || listing.title
                                      }
                                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                      fill
                                      sizes="(max-width: 1279px) 320px, 400px"
                                      src={listing.image.url}
                                      unoptimized
                                    />
                                  ) : (
                                    <span className="flex h-full items-center justify-center bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] bg-[size:16px_16px] font-serif text-2xl text-muted-foreground">
                                      {listing.title}
                                    </span>
                                  )}
                                </span>
                                <span className="border-t border-border bg-background p-3">
                                  <span className="block font-sans text-xs text-foreground">
                                    {listing.title}
                                  </span>
                                  <span className="mt-1 block font-sans text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                                    {listing.location ||
                                      (listing.listingType === "sale"
                                        ? isArabic
                                          ? "عقار للبيع"
                                          : "Property for sale"
                                        : isArabic
                                          ? "عقار للإيجار"
                                          : "Property for rent")}
                                  </span>
                                </span>
                              </Link>
                            ))}
                            {listingPreviews.length === 0 && (
                              <Link
                                className="group flex h-[277px] w-full max-w-[400px] shrink-0 flex-col overflow-hidden border border-border transition-all duration-200 hover:scale-[1.02] hover:border-foreground/20 hover:opacity-90"
                                href="/portfolio"
                                onClick={() => setIsServicesOpen(false)}
                              >
                                <span className="flex flex-1 items-center justify-center bg-secondary">
                                  <span className="font-serif text-2xl text-muted-foreground">
                                    {portfolioLabel}
                                  </span>
                                </span>
                                <span className="border-t border-border bg-background p-3 font-sans text-xs text-foreground">
                                  {isArabic
                                    ? "أحدث العقارات"
                                    : "Latest properties"}
                                </span>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Link
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                href="/about"
              >
                {aboutLabel}
              </Link>
              <Link
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                href="/portfolio"
              >
                {portfolioLabel}
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
                    {signInLabel}
                  </Link>
                )}
              </div>
            </div>
          )}

          {!hideMenuItems && (
            <div className="flex items-center gap-2 xl:hidden">
              <button
                aria-expanded={isMenuOpen}
                aria-label={
                  isMenuOpen
                    ? isArabic
                      ? "إغلاق القائمة"
                      : "Close menu"
                    : isArabic
                      ? "فتح القائمة"
                      : "Open menu"
                }
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
                  {signInLabel}
                </Link>
              )}
            </div>
          )}
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
                <span>{servicesLabel}</span>
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
                      {isArabic ? "كل الخدمات" : "All services"}
                    </Link>
                    {marketingServices.map((service) => (
                      <Link
                        className="text-lg text-muted-foreground"
                        href={`/services/${service.slug}`}
                        key={service.slug}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {service.title[isArabic ? "ar" : "en"]}
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
              {aboutLabel}
            </Link>
            <Link
              className="py-2 text-2xl text-primary"
              href="/portfolio"
              onClick={() => setIsMenuOpen(false)}
            >
              {portfolioLabel}
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
