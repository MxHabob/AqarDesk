import { type NextRequest, NextResponse } from "next/server"
import { locales } from "./locales/config"

const defaultLocale = "ar"
const dashboardRoutePrefixes = new Set([
  "apps",
  "customers",
  "desktop",
  "inbox",
  "invoices",
  "listings",
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
    if (remainingSegments.join("/") === "account/login") {
      const url = request.nextUrl.clone()
      url.pathname = `/${firstSegment}/login`
      return NextResponse.redirect(url)
    }

    return withLocale(request, firstSegment)
  }

  const cookieLocale = request.cookies.get("Next-Locale")?.value
  const locale =
    cookieLocale && isAppLocale(cookieLocale) ? cookieLocale : defaultLocale

  if (firstSegment === "account" && remainingSegments[0] === "login") {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  if (firstSegment === "dashboard") {
    const url = request.nextUrl.clone()
    const oldLocale = remainingSegments[0]
    if (oldLocale && isAppLocale(oldLocale)) {
      const remainder = remainingSegments.slice(1).join("/")
      url.pathname = `/${oldLocale}/dashboard${remainder ? `/${remainder}` : ""}`
    } else {
      url.pathname = `/${locale}${pathname}`
    }
    return NextResponse.redirect(url)
  }

  if (firstSegment && dashboardRoutePrefixes.has(firstSegment)) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/dashboard${pathname}`
    return NextResponse.redirect(url)
  }

  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`
  return NextResponse.redirect(url)
}

function isAppLocale(locale: string): locale is (typeof locales)[number] {
  return locales.some((supportedLocale) => supportedLocale === locale)
}

function withLocale(request: NextRequest, locale: string) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("X-Next-Locale", locale)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  response.cookies.set("Next-Locale", locale, { sameSite: "strict" })

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image|twitter-image|.*\\..*).*)",
  ],
}
