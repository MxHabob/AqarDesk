"use client"

import { cn } from "@aqardesk/ui/cn"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCurrentLocale } from "@/locales/client"

type Item = {
  path: string
  label: string
}

type Props = {
  items: Item[]
}

export function SecondaryMenu({ items }: Props) {
  const pathname = usePathname()
  const locale = useCurrentLocale()

  return (
    <nav className="py-4">
      <ul className="flex flex-wrap gap-x-6 gap-y-4 text-sm">
        {items.map((item) => {
          const href = `/${locale}${item.path}`

          return (
            <li key={item.path}>
              <Link
                href={href}
                prefetch
                aria-current={pathname === href ? "page" : undefined}
                className={cn(
                  "text-[#606060]",
                  pathname === href &&
                    "text-primary font-medium underline underline-offset-8"
                )}
              >
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
