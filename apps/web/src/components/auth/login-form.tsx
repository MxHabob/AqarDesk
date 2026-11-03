"use client"

import { authClient } from "@aqardesk/auth/client"
import { Button } from "@aqardesk/ui/components/button"
import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"

export function LoginForm({ locale }: { locale: string }) {
  const router = useRouter()
  const isArabic = locale === "ar"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: `/${locale}/login/callback`,
      })

      if (result.error) {
        setError(
          isArabic
            ? "تعذر تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور."
            : "Unable to sign in. Check your email and password."
        )
        return
      }

      router.push(`/${locale}/login/callback`)
      router.refresh()
    } catch {
      setError(
        isArabic
          ? "تعذر الاتصال. حاول مرة أخرى."
          : "Unable to connect. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block space-y-2 text-sm font-medium">
        <span>{isArabic ? "البريد الإلكتروني" : "Email"}</span>
        <input
          autoComplete="email"
          className="w-full rounded-md border bg-background px-3 py-2 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
          dir="ltr"
          onChange={(event) => setEmail(event.currentTarget.value)}
          required
          type="email"
          value={email}
        />
      </label>

      <label className="block space-y-2 text-sm font-medium">
        <span>{isArabic ? "كلمة المرور" : "Password"}</span>
        <input
          autoComplete="current-password"
          className="w-full rounded-md border bg-background px-3 py-2 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
          dir="ltr"
          onChange={(event) => setPassword(event.currentTarget.value)}
          required
          type="password"
          value={password}
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting
          ? isArabic
            ? "جارٍ تسجيل الدخول..."
            : "Signing in..."
          : isArabic
            ? "دخول"
            : "Sign in"}
      </Button>
    </form>
  )
}
