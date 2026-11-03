import {
  auth,
  isEmailOtpConfigured,
  isGoogleAuthConfigured,
} from "@aqardesk/auth/server"
import { Icons } from "@aqardesk/ui/components/icons"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { LoginVideoBackground } from "@/components/login-video-background"
import { getRoleDestination, getUserRoleKeys } from "@/lib/auth/roles"
import ar from "@/locales/ar"
import en from "@/locales/en"

export const metadata: Metadata = {
  title: "Sign in | AqarDesk",
}

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string }>
}

export default async function Page({ params, searchParams }: Props) {
  const [{ locale }, { error }] = await Promise.all([params, searchParams])
  const session = await auth.api.getSession({ headers: await headers() })

  if (session) {
    const roleKeys = await getUserRoleKeys(session.user.id)
    const destination = getRoleDestination(roleKeys, locale)

    if (destination) {
      redirect(destination)
    }
  }

  const copy = locale === "ar" ? ar.auth : en.auth

  return (
    <main
      dir="ltr"
      className="dark relative flex min-h-svh bg-background text-foreground"
    >
      <header className="fixed inset-x-0 top-0 z-50 px-4 py-3 sm:px-6 xl:px-8">
        <Link
          href={`/${locale}`}
          aria-label="AqarDesk"
          className="inline-flex items-center transition-opacity hover:opacity-75"
        >
          <Icons.LogoSmall className="size-6 text-white" />
        </Link>
      </header>

      <LoginVideoBackground />

      <section
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="flex min-h-svh w-full flex-col items-center justify-center p-8 pb-2 lg:w-1/2 lg:p-12 lg:pb-2"
      >
        <div className="flex min-h-[calc(100svh-4rem)] w-full max-w-md flex-col lg:min-h-[calc(100svh-6rem)]">
          <div className="flex flex-1 flex-col justify-center space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="mb-4 font-serif text-lg lg:text-xl">
                {copy.loginTitle}
              </h1>
              <p className="font-sans text-sm text-muted-foreground">
                {copy.loginDescription}
              </p>
            </div>

            {error === "role" && (
              <p role="alert" className="text-center text-sm text-destructive">
                {copy.loginRoleError}
              </p>
            )}

            <LoginForm
              googleEnabled={isGoogleAuthConfigured}
              emailOtpEnabled={isEmailOtpConfigured}
            />
          </div>

          <footer className="mt-auto text-center">
            <p className="font-sans text-xs text-muted-foreground">
              {copy.signInTerms}{" "}
              <Link
                href={`/${locale}/terms`}
                className="underline transition-colors hover:text-foreground"
              >
                {copy.termsOfService}
              </Link>{" "}
              {copy.and}{" "}
              <Link
                href={`/${locale}/policy`}
                className="underline transition-colors hover:text-foreground"
              >
                {copy.privacyPolicy}
              </Link>
            </p>
          </footer>
        </div>
      </section>
    </main>
  )
}
