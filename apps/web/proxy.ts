import { auth } from "@aqardesk/auth/server"
import { type NextRequest, NextResponse } from "next/server"
import { createI18nMiddleware } from "next-international/middleware"
import { locales } from "./locales/config"

const handleI18n = createI18nMiddleware({
  locales: [...locales],
  defaultLocale: "ar",
  urlMappingStrategy: "rewrite",
})

function getSafeReturnTo(value: string | null, baseUrl: URL) {
  if (
    !value?.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return null
  }

  const url = new URL(value, baseUrl)
  return url.origin === baseUrl.origin && url.pathname !== "/login" ? url : null
}

export async function proxy(request: NextRequest) {
  const response = handleI18n(request)
  const pathnameLocale = request.nextUrl.pathname.split("/", 2)[1]
  const locale = locales.find(
    (supportedLocale) => supportedLocale === pathnameLocale
  )
  const pathnameWithoutLocale = locale
    ? request.nextUrl.pathname.slice(locale.length + 1)
    : request.nextUrl.pathname

  if (locale) {
    const url = request.nextUrl.clone()
    url.pathname = pathnameWithoutLocale || "/"

    const redirectResponse = NextResponse.redirect(url)
    redirectResponse.cookies.set("Next-Locale", locale, { sameSite: "strict" })
    return redirectResponse
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return response
  }

  const resolvedLocale = response.headers.get("X-Next-Locale") ?? "ar"
  const isLoginPage =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/login/"
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session && !isLoginPage) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.search = ""
    loginUrl.searchParams.set(
      "return_to",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    )

    const redirectResponse = NextResponse.redirect(loginUrl)
    redirectResponse.cookies.set("Next-Locale", resolvedLocale, {
      sameSite: "strict",
    })
    return redirectResponse
  }

  if (session && isLoginPage) {
    const returnTo = getSafeReturnTo(
      request.nextUrl.searchParams.get("return_to"),
      request.nextUrl
    )
    const redirectResponse = NextResponse.redirect(
      returnTo ?? new URL("/", request.url)
    )
    redirectResponse.cookies.set("Next-Locale", resolvedLocale, {
      sameSite: "strict",
    })
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image|twitter-image|.*\\..*).*)",
  ],
}
