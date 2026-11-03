"use client"

import { Icons } from "@aqardesk/ui/components/icons"
import { cn } from "@aqardesk/ui/lib/utils"
import { Building2, Tag, UsersRound } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useCurrentLocale, useI18n } from "@/locales/client"

const icons = {
  "/": () => <Icons.Overview size={20} />,
  "/properties": () => <Building2 size={20} />,
  "/listings": () => <Tag size={20} />,
  "/owners": () => <UsersRound size={20} />,
  "/reports": () => <Icons.Monitoring size={20} />,
  "/settings": () => <Icons.Settings size={20} />,
} as const

interface ItemProps {
  item: {
    path: string
    href: string
    name: string
    children?: { path: string; href: string; name: string }[]
  }
  isActive: boolean
  isExpanded: boolean
  isItemExpanded: boolean
  onToggle: (path: string) => void
  onSelect?: () => void
}

const ChildItem = ({
  child,
  isActive,
  isExpanded,
  shouldShow,
  onSelect,
  index,
}: {
  child: { path: string; href: string; name: string }
  isActive: boolean
  isExpanded: boolean
  shouldShow: boolean
  onSelect?: () => void
  index: number
}) => {
  const showChild = isExpanded && shouldShow

  return (
    <Link
      href={child.href}
      prefetch
      onClick={() => onSelect?.()}
      className="block group/child"
    >
      <div className="relative">
        {/* Child item text */}
        <div
          className={cn(
            "ms-[35px] me-[15px] h-[32px] flex items-center",
            "border-s border-[#e6e6e6] dark:border-[#1d1d1d] ps-3",
            "transition-all duration-200 ease-out",
            showChild
              ? "opacity-100 translate-x-0"
              : "opacity-0 ltr:-translate-x-2 rtl:translate-x-2"
          )}
          style={{
            transitionDelay: showChild
              ? `${40 + index * 20}ms`
              : `${index * 20}ms`,
          }}
        >
          <span
            className={cn(
              "text-xs font-medium transition-colors duration-200",
              "text-[#888] group-hover/child:text-primary",
              "whitespace-nowrap overflow-hidden",
              isActive && "text-primary"
            )}
          >
            {child.name}
          </span>
        </div>
      </div>
    </Link>
  )
}

const Item = ({
  item,
  isActive,
  isExpanded,
  isItemExpanded,
  onToggle,
  onSelect,
}: ItemProps) => {
  const Icon = icons[item.path as keyof typeof icons]
  const pathname = usePathname()
  const hasChildren = item.children && item.children.length > 0

  // Children should be visible when: expanded sidebar AND this item is expanded
  const shouldShowChildren = isExpanded && isItemExpanded

  const handleChevronClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggle(item.path)
  }

  return (
    <div className="group">
      <Link
        href={item.href}
        prefetch
        onClick={() => onSelect?.()}
        className="group"
      >
        <div className="relative">
          {/* Background that expands */}
          <div
            className={cn(
              "border border-transparent h-[40px] transition-all duration-200 ease-&lsqb;cubic-bezier(0.4,0,0.2,1)&rsqb; ms-[15px] me-[15px]",
              isActive &&
                "bg-[#f7f7f7] dark:bg-[#131313] border-[#e6e6e6] dark:border-[#1d1d1d]",
              isExpanded ? "w-[calc(100%-30px)]" : "w-[40px]"
            )}
          />

          {/* Icon - always in same position from sidebar edge */}
          <div className="absolute top-0 start-[15px] w-[40px] h-[40px] flex items-center justify-center dark:text-[#666666] text-black group-hover:!text-primary pointer-events-none">
            <div className={cn(isActive && "dark:!text-white")}>
              <Icon />
            </div>
          </div>

          {isExpanded && (
            <div className="absolute top-0 start-[55px] end-[4px] h-[40px] flex items-center pointer-events-none">
              <span
                className={cn(
                  "text-sm font-medium transition-opacity duration-200 ease-in-out text-[#666] group-hover:text-primary",
                  "whitespace-nowrap overflow-hidden",
                  hasChildren ? "pe-2" : "",
                  isActive && "text-primary"
                )}
              >
                {item.name}
              </span>
              {hasChildren && (
                <button
                  type="button"
                  onClick={handleChevronClick}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center transition-all duration-200 ms-auto me-3",
                    "text-[#888] hover:text-primary pointer-events-auto",
                    isActive && "text-primary/60",
                    shouldShowChildren && "rotate-180"
                  )}
                >
                  <Icons.ChevronDown size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Children */}
      {hasChildren && (
        <div
          className={cn(
            "transition-all duration-300 ease-out overflow-hidden",
            shouldShowChildren ? "max-h-96 mt-1" : "max-h-0"
          )}
        >
          {item.children?.map((child, index) => {
            const isChildActive = pathname === child.href
            return (
              <ChildItem
                key={child.path}
                child={child}
                isActive={isChildActive}
                isExpanded={isExpanded}
                shouldShow={shouldShowChildren}
                onSelect={onSelect}
                index={index}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

type Props = {
  onSelect?: () => void
  isExpanded?: boolean
}

export function MainMenu({ onSelect, isExpanded = false }: Props) {
  const pathname = usePathname()
  const locale = useCurrentLocale()
  const t = useI18n()
  const dashboardPath = `/${locale}/dashboard`
  const items = [
    { path: "/", name: t("navigation.overview") },
    { path: "/reports", name: t("navigation.reports") },
    { path: "/properties", name: t("common.properties") },
    { path: "/listings", name: t("common.listings") },
    { path: "/owners", name: t("common.owners") },
    {
      path: "/settings",
      name: t("common.settings"),
      children: [
        { path: "/settings", name: t("navigation.general") },
        { path: "/settings/members", name: t("navigation.members") },
      ],
    },
  ]
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  // Reset expanded item when sidebar expands/collapses
  useEffect(() => {
    setExpandedItem(null)
  }, [isExpanded])

  return (
    <div className="mt-4 w-full">
      <nav className="w-full">
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const itemPath =
              item.path === "/" ? dashboardPath : `${dashboardPath}${item.path}`
            const isActive = Boolean(
              pathname === itemPath ||
                pathname.startsWith(`${itemPath}/`) ||
                item.children?.some(
                  (child) => pathname === `${dashboardPath}${child.path}`
                )
            )

            return (
              <Item
                key={item.path}
                item={{
                  ...item,
                  href: itemPath,
                  children: item.children?.map((child) => ({
                    ...child,
                    href: `${dashboardPath}${child.path}`,
                  })),
                }}
                isActive={isActive}
                isExpanded={isExpanded}
                isItemExpanded={expandedItem === item.path}
                onToggle={(path) => {
                  setExpandedItem(expandedItem === path ? null : path)
                }}
                onSelect={onSelect}
              />
            )
          })}
        </div>
      </nav>
    </div>
  )
}
