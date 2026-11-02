import { type NextRequest, NextResponse } from "next/server"
import { createI18nMiddleware } from "next-international/middleware"
import { locales } from "./locales/config"

const handleI18n = createI18nMiddleware({
  locales: [...locales],
  defaultLocale: "ar",
  urlMappingStrategy: "rewrite",
})

export function proxy(request: NextRequest) {
  const originalPathname = request.nextUrl.pathname
  const localePrefix = locales.find(
    (locale) => locale === originalPathname.split("/", 2)[1]
  )
  const response = handleI18n(request)

  if (localePrefix && !response.headers.has("location")) {
    const url = request.nextUrl.clone()
    url.pathname = originalPathname.slice(localePrefix.length + 1) || "/"
    const redirectResponse = NextResponse.redirect(url)

    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie)
    }

    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image|twitter-image|.*\\..*).*)",
  ],
}
