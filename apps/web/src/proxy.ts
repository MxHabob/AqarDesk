import { auth } from "@aqardesk/auth/server"
import { type NextRequest, NextResponse } from "next/server"
import { createI18nMiddleware } from "next-international/middleware"
import { locales } from "./locales/config"

const handleI18n = createI18nMiddleware({
  locales: [...locales],
  defaultLocale: "ar",
  urlMappingStrategy: "redirect",
})

function getSafeReturnTo(
  value: string | null,
  baseUrl: URL,
  locale: (typeof locales)[number]
) {
  if (
    !value?.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return null
  }

  const url = new URL(value, baseUrl)
  const loginPath = `/${locale}/login`
  const localePath = `/${locale}`

  return url.origin === baseUrl.origin &&
    (url.pathname === localePath ||
      url.pathname.startsWith(`${localePath}/`)) &&
    url.pathname !== loginPath
    ? url
    : null
}

export async function proxy(request: NextRequest) {
  const response = handleI18n(request)
  const pathnameLocale = request.nextUrl.pathname.split("/", 2)[1]
  const locale = locales.find(
    (supportedLocale) => supportedLocale === pathnameLocale
  )

  if (!locale) {
    return response
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return response
  }

  const isLoginPage = request.nextUrl.pathname === `/${locale}/login`
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session && !isLoginPage) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = `/${locale}/login`
    loginUrl.search = ""
    loginUrl.searchParams.set(
      "return_to",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    )

    return NextResponse.redirect(loginUrl)
  }

  if (session && isLoginPage) {
    const returnTo = getSafeReturnTo(
      request.nextUrl.searchParams.get("return_to"),
      request.nextUrl,
      locale
    )
    return NextResponse.redirect(returnTo ?? new URL(`/${locale}`, request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image|twitter-image|.*\\..*).*)",
  ],
}
