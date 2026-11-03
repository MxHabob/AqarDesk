"use client"

import { Icons } from "@aqardesk/ui/icons"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useI18n } from "@/locales/client"
import { BuildingsInFooter } from "./buildings-in-footer"

export function Footer() {
  const t = useI18n()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const linkGroups = [
    {
      title: t("marketingFooter.properties"),
      items: [
        { href: "/listings", label: t("marketingFooter.allListings") },
        {
          href: "/listings?listingType=sale",
          label: t("marketingFooter.forSale"),
        },
        {
          href: "/listings?listingType=rent",
          label: t("marketingFooter.forRent"),
        },
      ],
    },
    {
      title: t("marketingFooter.aboutAqarDesk"),
      items: [
        { href: "/about", label: t("marketingFooter.aboutUs") },
        { href: "/testimonials", label: t("marketingFooter.customerStories") },
      ],
    },
    {
      title: t("marketingFooter.help"),
      items: [
        { href: "/terms", label: t("marketingFooter.terms") },
        { href: "/policy", label: t("marketingFooter.privacy") },
      ],
    },
  ]

  useEffect(() => {
    setMounted(true)
  }, [])
  return (
    <footer className="bg-background relative overflow-hidden">
      {/* Top Divider - Full Bleed */}
      <div className="h-px w-full border-t border-border" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-16">
          {/* Left Column - Links */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-12 lg:col-span-1">
            {linkGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <h3 className="mb-4 font-sans text-sm text-foreground">
                  {group.title}
                </h3>
                <div className="space-y-2.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Tagline & Compliance */}
          <div className="flex flex-col items-start lg:items-end gap-6 lg:gap-10">
            <p className="font-sans text-base sm:text-xl text-foreground text-left lg:text-right">
              {t("marketingFooter.tagline")}
            </p>

            {/* Compliance Section */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9">
                  <Image
                    src="/images/gdpr.png"
                    alt={t("marketingFooter.gdprAlt")}
                    width={36}
                    height={36}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-center">
                  <p className="font-sans text-xs text-foreground">
                    {t("marketingFooter.gdpr")}
                  </p>
                  <p className="font-sans text-xs text-muted-foreground">
                    {t("marketingFooter.compliant")}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9">
                  <Image
                    src="/images/soc2.png"
                    alt={t("marketingFooter.soc2Alt")}
                    width={36}
                    height={36}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-center">
                  <p className="font-sans text-xs text-foreground">
                    {t("marketingFooter.soc2")}
                  </p>
                  <p className="font-sans text-xs text-muted-foreground">
                    {t("marketingFooter.inProgress")}
                  </p>
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="flex items-center gap-2 px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
              aria-label={t("marketingFooter.toggleTheme")}
            >
              {mounted ? (
                resolvedTheme === "dark" ? (
                  <Icons.LightMode className="w-4 h-4" />
                ) : (
                  <Icons.DarkMode className="w-4 h-4" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
              <span className="font-sans text-sm">
                {mounted
                  ? resolvedTheme === "dark"
                    ? t("marketingFooter.lightMode")
                    : t("marketingFooter.darkMode")
                  : t("marketingFooter.toggleTheme")}
              </span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="my-16">
          <div className="h-px w-full border-t border-border" />
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="hidden md:flex items-center gap-2">
            <span className="font-sans text-sm text-muted-foreground">
              AqarDesk
            </span>
          </div>
          <p className="font-sans text-sm text-muted-foreground">
            {t("marketingFooter.copyright", {
              year: new Date().getFullYear(),
            })}
          </p>
        </div>
      </div>

      {/* Footer Illustration */}
      <div className="mx-auto aspect-[1879/290] w-full max-w-[1879px] overflow-hidden">
        <BuildingsInFooter />
      </div>
    </footer>
  )
}
