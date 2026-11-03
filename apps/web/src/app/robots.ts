import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/marketing/metadata"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/ar/dashboard/",
        "/en/dashboard/",
        "/ar/account/",
        "/en/account/",
        "/ar/login",
        "/en/login",
        "/ar/mfa/",
        "/en/mfa/",
        "/api/",
      ],
    },
    sitemap: getSiteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  }
}
