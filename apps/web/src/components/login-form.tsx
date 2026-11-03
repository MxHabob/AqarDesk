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
  const [name, setName] = useState("")
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(false)
    setIsLoading(true)

    try {
      const callbackURL = `/${locale}/login/callback`
      const result = isSigningUp
        ? await authClient.signUp.email({
            name,
            email,
            password,
            callbackURL,
          })
        : await authClient.signIn.email({ email, password, callbackURL })

      if (result.error) {
        setError(true)
        return
      }

      if (
        "twoFactorRedirect" in result.data &&
        result.data.twoFactorRedirect
      ) {
        return
      }

      router.replace(callbackURL)
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {isSigningUp && (
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              {t("auth.name")}
            </label>
            <Input
              id="name"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isLoading}
            />
          </div>
        )}
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
            minLength={isSigningUp ? 8 : undefined}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {isSigningUp ? t("auth.registerError") : t("auth.loginError")}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? isSigningUp
              ? t("auth.registering")
              : t("auth.loggingIn")
            : isSigningUp
              ? t("auth.register")
              : t("auth.login")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {isSigningUp ? t("auth.haveAccount") : t("auth.noAccount")}{" "}
        <button
          type="button"
          className="text-foreground underline underline-offset-4"
          onClick={() => {
            setError(false)
            setIsSigningUp((current) => !current)
          }}
          disabled={isLoading}
        >
          {isSigningUp ? t("auth.signIn") : t("auth.signUp")}
        </button>
      </p>

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
