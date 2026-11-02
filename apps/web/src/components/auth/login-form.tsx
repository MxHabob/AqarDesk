"use client"

import { authClient } from "@aqardesk/auth/client"
import { Button } from "@aqardesk/ui/components/button"
import { Input } from "@aqardesk/ui/components/input"
import { Label } from "@aqardesk/ui/components/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useScopedI18n } from "@/locales/client"

export function LoginForm({
  defaultDestination = "/dashboard",
}: {
  defaultDestination?: string
}) {
  const t = useScopedI18n("auth")
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    const result = await authClient.signIn.email({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    })

    setIsPending(false)

    if (result.error) {
      setError(t("loginError"))
      return
    }

    const returnTo = new URLSearchParams(window.location.search).get(
      "return_to"
    )
    const destination =
      returnTo?.startsWith("/") &&
      !returnTo.startsWith("//") &&
      !returnTo.includes("\\")
        ? returnTo
        : defaultDestination

    router.replace(destination)
    router.refresh()
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? t("loggingIn") : t("login")}
      </Button>
    </form>
  )
}
