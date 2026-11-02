"use client"

import { cn } from "@aqardesk/ui/lib/utils"
import {
  Building2,
  Heart,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useScopedI18n } from "@/locales/client"

const navigation = [
  { href: "/dashboard", key: "dashboard" as const, icon: LayoutDashboard },
  { href: "/listings", key: "listings" as const, icon: Building2 },
  { href: "/properties", key: "properties" as const, icon: Building2 },
  { href: "/owners", key: "owners" as const, icon: Users },
  { href: "/favorites", key: "favorites" as const, icon: Heart },
  { href: "/settings", key: "settings" as const, icon: Settings },
]

export function AppSidebar() {
  const t = useScopedI18n("common")
  const pathname = usePathname()

  return (
    <aside className="hidden w-60 shrink-0 border-e bg-card md:block">
      <div className="flex h-16 items-center border-b px-6 font-semibold">
        AqarDesk
      </div>
      <nav className="space-y-1 p-3" aria-label={t("navigationLabel")}>
        {navigation.map(({ href, key, icon: Icon }) => {
          const target = href
          const active = pathname === target

          return (
            <Link
              key={key}
              href={target}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted",
                active && "bg-muted font-medium"
              )}
            >
              <Icon aria-hidden="true" className="size-4" />
              {t(key)}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
