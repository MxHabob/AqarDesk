"use client"

import { createAuthClient } from "better-auth/react"
import { twoFactorClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect: ({ twoFactorMethods }) => {
        const locale =
          window.location.pathname.match(/^\/(ar|en)(?:\/|$)/)?.[1] ?? "en"
        const query = new URLSearchParams()

        if (twoFactorMethods?.length) {
          query.set("methods", twoFactorMethods.join(","))
        }

        const queryString = query.toString()
        window.location.assign(
          `/${locale}/mfa/verify${queryString ? `?${queryString}` : ""}`,
        )
      },
    }),
  ],
})
