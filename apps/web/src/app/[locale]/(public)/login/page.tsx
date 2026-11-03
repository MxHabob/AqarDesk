import { auth, isGoogleAuthConfigured } from "@aqardesk/auth/server"
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
    <div className="min-h-screen bg-background flex relative">
      <div className="fixed top-0 left-0 right-0 z-50 w-full">
        <nav className="w-full pointer-events-none">
          <div className="relative py-3 xl:py-4 px-4 sm:px-4 md:px-4 lg:px-4 xl:px-6 2xl:px-8 flex items-center">
            <Link
              href={`/${locale}`}
              aria-label="AqarDesk"
              className="flex items-center gap-2 hover:opacity-80 active:opacity-80 transition-opacity duration-200 pointer-events-auto"
            >
              <div className="w-6 h-6">
                <Icons.LogoSmall className="w-full h-full text-foreground lg:text-white" />
              </div>
            </Link>
          </div>
        </nav>
      </div>

      <LoginVideoBackground />

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 pb-2">
        <div className="w-full max-w-md flex flex-col h-full">
          <div className="space-y-8 flex-1 flex flex-col justify-center">
            <div className="text-center space-y-2">
              <h1 className="text-lg lg:text-xl mb-4 font-serif">
                {copy.loginTitle}
              </h1>
              <p className="font-sans text-sm text-[#878787]">
                {copy.loginDescription}
              </p>
            </div>

            {error === "role" && (
              <p role="alert" className="text-center text-sm text-destructive">
                {copy.loginRoleError}
              </p>
            )}

            <LoginForm googleEnabled={isGoogleAuthConfigured} />
          </div>

          <div className="text-center mt-auto">
            <p className="font-sans text-xs text-[#878787]">
              {copy.signInTerms}{" "}
              <Link
                href={`/${locale}/terms`}
                className="text-[#878787] hover:text-foreground transition-colors underline"
              >
                {copy.termsOfService}
              </Link>{" "}
              {copy.and}{" "}
              <Link
                href={`/${locale}/policy`}
                className="text-[#878787] hover:text-foreground transition-colors underline"
              >
                {copy.privacyPolicy}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
