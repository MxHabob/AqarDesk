"use client"

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
import { useFileUrl } from "@/hooks/use-file-url"
import { useUserQuery } from "@/hooks/use-user"
import { useCurrentLocale } from "@/locales/client"
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
      <DropdownMenuTrigger
        aria-label="Open user menu"
        className="flex rounded-full border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="rounded-full w-8 h-8 cursor-pointer bg-accent">
          {avatarUrl && (
            <AvatarImageNext
              src={avatarUrl}
              alt={user?.fullName ?? ""}
              width={32}
              height={32}
              quality={100}
            />
          )}
          <AvatarFallback>
            <span className="text-xs">
              {user?.fullName?.charAt(0).toUpperCase()}
            </span>
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px]" sideOffset={10} align="end">
        {!onlySignOut && (
          <>
            <DropdownMenuLabel className="normal-case tracking-normal">
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
                <DropdownMenuItem className="text-xs normal-case tracking-normal">
                  Account
                </DropdownMenuItem>
              </Link>

              <Link href={`/${locale}/account/support`}>
                <DropdownMenuItem className="text-xs normal-case tracking-normal">
                  Support
                </DropdownMenuItem>
              </Link>

              <Link href={`/${locale}/dashboard/teams`}>
                <DropdownMenuItem className="text-xs normal-case tracking-normal">
                  Teams
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <Link href={`/${locale}/apps`}>
                <DropdownMenuItem className="text-xs normal-case tracking-normal">
                  Apps
                </DropdownMenuItem>
              </Link>
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
    </DropdownMenu>
  )
}
