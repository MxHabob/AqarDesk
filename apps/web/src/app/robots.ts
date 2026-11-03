import type { MetadataRoute } from "next"
import { getSiteUrl, siteOrigin } from "@/lib/marketing/metadata"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/ar/dashboard",
        "/en/dashboard",
        "/account",
        "/ar/account",
        "/en/account",
        "/login",
        "/ar/login",
        "/en/login",
        "/mfa",
        "/ar/mfa",
        "/en/mfa",
        "/ar/mfa/",
        "/en/mfa/",
        "/properties",
        "/owners",
        "/customers",
        "/invoices",
        "/transactions",
        "/reports",
        "/settings",
        "/teams",
        "/apps",
        "/tracker",
        "/vault",
      ],
    },
    sitemap: getSiteUrl("/sitemap.xml"),
    host: siteOrigin,
  }
}
