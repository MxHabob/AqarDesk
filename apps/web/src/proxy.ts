import { type NextRequest, NextResponse } from "next/server"
import { locales } from "./locales/config"

const defaultLocale = "ar"
const dashboardRoutePrefixes = new Set([
  "apps",
  "customers",
  "desktop",
  "inbox",
  "invoices",
  "mfa",
  "oauth",
  "onboarding",
  "reports",
  "owners",
  "properties",
  "settings",
  "teams",
  "tracker",
  "transactions",
  "upgrade",
  "vault",
])

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const [, firstSegment, ...remainingSegments] = pathname.split("/")

  if (firstSegment && isAppLocale(firstSegment)) {
    const locale = firstSegment
    const localeFreePath = `/${remainingSegments.join("/")}`
    const pathnameWithoutLocale =
      localeFreePath === "/account/login" ? "/login" : localeFreePath
    return redirectWithoutLocale(request, pathnameWithoutLocale, locale)
  }

  const locale = getLocale(request)

  if (firstSegment === "account" && remainingSegments[0] === "login") {
    return redirectWithoutLocale(request, "/login", locale)
  }

  if (firstSegment === "dashboard") {
    const oldLocale = remainingSegments[0]
    if (oldLocale && isAppLocale(oldLocale)) {
      const remainder = remainingSegments.slice(1).join("/")
      return redirectWithoutLocale(
        request,
        `/dashboard${remainder ? `/${remainder}` : ""}`,
        oldLocale
      )
    }

    return rewriteWithLocale(request, `/${locale}${pathname}`, locale)
  }

  if (firstSegment && dashboardRoutePrefixes.has(firstSegment)) {
    return rewriteWithLocale(request, `/${locale}/dashboard${pathname}`, locale)
  }

  return rewriteWithLocale(
    request,
    `/${locale}${pathname === "/" ? "" : pathname}`,
    locale
  )
}

function isAppLocale(locale: string): locale is (typeof locales)[number] {
  return locales.some((supportedLocale) => supportedLocale === locale)
}

function getLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get("Next-Locale")?.value
  if (cookieLocale && isAppLocale(cookieLocale)) {
    return cookieLocale
  }

  const acceptLanguage = request.headers.get("Accept-Language")
  const preferredLocale = acceptLanguage?.split(",", 1)[0]?.split("-", 1)[0]

  return preferredLocale && isAppLocale(preferredLocale)
    ? preferredLocale
    : defaultLocale
}

function rewriteWithLocale(
  request: NextRequest,
  pathname: string,
  locale: string
) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("X-Next-Locale", locale)

  const response = NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  })

  response.cookies.set("Next-Locale", locale, { sameSite: "strict" })

  return response
}

function redirectWithoutLocale(
  request: NextRequest,
  pathname: string,
  locale: string
) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  const response = NextResponse.redirect(url)
  response.cookies.set("Next-Locale", locale, { sameSite: "strict" })
  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image|twitter-image|.*\\..*).*)",
  ],
}
