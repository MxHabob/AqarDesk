"use client"

import { authClient } from "@aqardesk/auth/client"
import { Button } from "@aqardesk/ui/components/button"
import { Input } from "@aqardesk/ui/components/input"
import { Label } from "@aqardesk/ui/components/label"
import { useRouter } from "next/navigation"
import type { FormEvent } from "react"
import { useState } from "react"
import { useScopedI18n } from "@/locales/client"

export function RegisterForm() {
  const t = useScopedI18n("auth")
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsPending(true)

    const formData = new FormData(event.currentTarget)

    try {
      const result = await authClient.signUp.email({
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        password: String(formData.get("password")),
      })

      if (result.error) {
        setError(t("registerError"))
        return
      }

      router.replace("/account")
      router.refresh()
    } catch {
      setError(t("registerError"))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">{t("name")}</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          minLength={2}
          maxLength={100}
          required
        />
      </div>
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
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? t("registering") : t("register")}
      </Button>
    </form>
  )
}
