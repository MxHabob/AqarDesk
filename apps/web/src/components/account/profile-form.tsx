"use client"

import { authClient } from "@aqardesk/auth/client"
import { Button } from "@aqardesk/ui/components/button"
import { Input } from "@aqardesk/ui/components/input"
import { Label } from "@aqardesk/ui/components/label"
import type { FormEvent } from "react"
import { useState } from "react"
import { useScopedI18n } from "@/locales/client"

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const t = useScopedI18n("account")
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setError(null)
    setIsPending(true)

    const formData = new FormData(event.currentTarget)

    try {
      const result = await authClient.updateUser({
        name: String(formData.get("name")).trim(),
      })

      if (result.error) {
        setError(t("profileError"))
        return
      }

      setMessage(t("profileSaved"))
    } catch {
      setError(t("profileError"))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="profile-name">{t("name")}</Label>
        <Input
          id="profile-name"
          name="name"
          defaultValue={name}
          minLength={2}
          maxLength={100}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-email">{t("email")}</Label>
        <Input id="profile-email" value={email} readOnly />
      </div>
      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? t("savingProfile") : t("saveProfile")}
      </Button>
    </form>
  )
}
