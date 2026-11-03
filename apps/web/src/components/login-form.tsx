"use client"

import { authClient } from "@aqardesk/auth/client"
import { Button } from "@aqardesk/ui/components/button"
import { Input } from "@aqardesk/ui/components/input"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { useCurrentLocale, useI18n } from "@/locales/client"
import { OAuthSignIn } from "@/components/oauth-sign-in"

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const locale = useCurrentLocale()
  const router = useRouter()
  const t = useI18n()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(false)
    setIsLoading(true)

    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: `/${locale}/login/callback`,
      })

      if (signInError) {
        setError(true)
        return
      }

      router.replace(`/${locale}/login/callback`)
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            {t("auth.email")}
          </label>
          <Input
            id="email"
            autoComplete="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            {t("auth.password")}
          </label>
          <Input
            id="password"
            autoComplete="current-password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {t("auth.loginError")}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("auth.loggingIn") : t("auth.login")}
        </Button>
      </form>

      {googleEnabled && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-2 text-sm text-muted-foreground">
                {t("auth.or")}
              </span>
            </div>
          </div>
          <OAuthSignIn enabled={googleEnabled} />
        </>
      )}
    </div>
  )
}
