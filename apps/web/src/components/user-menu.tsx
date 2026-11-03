"use client"

import {
  ChatGPTMcpLogo,
  ClaudeMcpLogo,
  CursorMcpLogo,
  GeminiMcpLogo,
  MiddayDesktopLogo,
} from "@aqardesk/app-store/logos"
import { isDesktopApp } from "@aqardesk/desktop-client/platform"
import { Avatar, AvatarFallback, AvatarImageNext } from "@aqardesk/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@aqardesk/ui/dropdown-menu"
import Link from "next/link"
import { useCurrentLocale } from "@/locales/client"
import { useFileUrl } from "@/hooks/use-file-url"
import { useUserQuery } from "@/hooks/use-user"
import { SignOut } from "./sign-out"
import { ThemeSwitch } from "./theme-switch"

type Props = {
  onlySignOut?: boolean
}

export function UserMenu({ onlySignOut }: Props) {
  const { data: user } = useUserQuery()
  const locale = useCurrentLocale()
  const { url: avatarUrl } = useFileUrl(
    user?.avatarUrl ? { type: "url", url: user.avatarUrl } : null
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="rounded-full w-8 h-8 cursor-pointer bg-accent">
          {avatarUrl && (
            <AvatarImageNext
              src={avatarUrl}
              alt={user.fullName ?? ""}
              width={32}
              height={32}
              quality={100}
            />
          )}
          <AvatarFallback>
            <span className="text-xs">
              {user?.fullName.charAt(0).toUpperCase()}
            </span>
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px]" sideOffset={10} align="end">
        {!onlySignOut && (
          <>
            <DropdownMenuLabel>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="truncate line-clamp-1 max-w-[155px] block text-xs">
                    {user?.fullName}
                  </span>
                  <span className="truncate text-xs text-[#606060] font-normal">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <Link href={`/${locale}/account`}>
                <DropdownMenuItem className="text-xs">Account</DropdownMenuItem>
              </Link>

              <Link href={`/${locale}/account/support`}>
                <DropdownMenuItem className="text-xs">Support</DropdownMenuItem>
              </Link>

              <Link href={`/${locale}/account/teams`}>
                <DropdownMenuItem className="text-xs">Teams</DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <Link href={`/${locale}/apps`}>
                <DropdownMenuItem className="text-xs flex items-center justify-between">
                  <span>Apps</span>
                  <div
                    className="flex items-center -space-x-1.5 mr-1 animate-in fade-in duration-500"
                    style={{
                      animationDelay: "100ms",
                      animationFillMode: "backwards",
                    }}
                  >
                    {[
                      ChatGPTMcpLogo,
                      ClaudeMcpLogo,
                      GeminiMcpLogo,
                      CursorMcpLogo,
                    ].map((Logo, i) => (
                      <div
                        key={i}
                        className="size-4 rounded-full overflow-hidden border-2 border-background user-menu-mcp-icon"
                      >
                        <Logo />
                      </div>
                    ))}
                  </div>
                </DropdownMenuItem>
              </Link>

              {!isDesktopApp() && (
                <Link
                  href="https://midday.ai/api/download"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DropdownMenuItem className="text-xs flex items-center justify-between">
                    <span>Download Mac app</span>
                    <div
                      className="size-4 rounded overflow-hidden user-menu-mcp-icon mr-1 animate-in fade-in duration-500"
                      style={{
                        animationDelay: "150ms",
                        animationFillMode: "backwards",
                      }}
                    >
                      <MiddayDesktopLogo />
                    </div>
                  </DropdownMenuItem>
                </Link>
              )}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <div className="flex flex-row justify-between items-center px-2 py-1.5">
              <p className="text-xs">Theme</p>
              <ThemeSwitch />
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <SignOut />
      </DropdownMenuContent>
      <style>
        {
          ".user-menu-mcp-icon img, .user-menu-mcp-icon svg { width: 100% !important; height: 100% !important; }"
        }
      </style>
    </DropdownMenu>
  )
}
