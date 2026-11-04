"use client"

import { SignOut } from "@/components/account/sign-out"
import { ChangeEmail } from "@/components/change-email"
import { ChangeTheme } from "@/components/change-theme"
import { DeleteAccount } from "@/components/delete-account"
import { DisplayName } from "@/components/display-name"
import { UserAvatar } from "@/components/user-avatar"

export function AccountSettings() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <UserAvatar />
      <DisplayName />
      <ChangeEmail />
      <ChangeTheme />
      <SignOut />
      <DeleteAccount />
    </div>
  )
}
