"use client"

import { cn } from "@aqardesk/ui/cn"
import { Button } from "@aqardesk/ui/components/button"
import { Icons } from "@aqardesk/ui/icons"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useI18n, useScopedI18n } from "@/locales/client"

export function AccountNavigation({
  locale,
  roleDestination,
}: {
  locale: string
  roleDestination: string | null
}) {
  const t = useScopedI18n("account")
  const accountSettings = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const items = [
    { href: `/${locale}/account`, label: t("title") },
    {
      href: `/${locale}/account/date-and-locale`,
      label: accountSettings("accountSettings.dateAndLocale"),
    },
    {
      href: `/${locale}/account/security`,
      label: accountSettings("accountSettings.security"),
    },
    {
      href: `/${locale}/account/favorites`,
      label: t("favoritesTitle"),
    },
    {
      href: `/${locale}/account/teams`,
      label: accountSettings("accountSettings.teams"),
    },
    {
      href: `/${locale}/account/support`,
      label: accountSettings("accountSettings.support"),
    },
  ]

  function goBack() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(`/${locale}`)
    }
  }

  return (
    <div className="border-b pb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <nav
          aria-label={t("navigationLabel")}
          className="w-full min-w-0 sm:flex-1"
        >
          <ul className="flex gap-5 overflow-x-auto pb-2 text-sm sm:pb-0">
            {items.map((item) => (
              <li className="shrink-0" key={item.href}>
                <Link
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cn(
                    "text-muted-foreground transition-colors hover:text-foreground",
                    pathname === item.href &&
                      "font-medium text-foreground underline underline-offset-8"
                  )}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <Button
            aria-label={accountSettings("common.close")}
            onClick={goBack}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Icons.Close aria-hidden="true" className="size-5" />
          </Button>
          {roleDestination === `/${locale}/dashboard` && (
            <Button
              onClick={() => router.push(roleDestination)}
              type="button"
              variant="outline"
            >
              {accountSettings("auth.openDashboard")}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
