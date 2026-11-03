import type { Metadata } from "next"
import type { AppLocale } from "@/locales/config"

const deploymentHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
const configuredUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (deploymentHost ? `https://${deploymentHost}` : "http://localhost:3000")

export const siteOrigin = new URL(configuredUrl).origin

export function getSiteUrl(path = "") {
  return new URL(path, `${siteOrigin}/`).toString()
}

const pageCopy = {
  ar: {
    home: {
      title: "إدارة العقارات والمكاتب العقارية",
      description:
        "عقار دِسك منصة لإدارة العقارات والعروض والملاك والعملاء، تساعد المكاتب العقارية على تنظيم أعمالها ومتابعة تفاصيل كل عقار.",
      keywords: [
        "إدارة العقارات",
        "برنامج إدارة مكاتب عقارية",
        "إدارة عروض عقارية",
        "عقارات للبيع والإيجار",
        "عقار دِسك",
      ],
    },
    about: {
      title: "عن عقار دِسك",
      description:
        "تعرّف على عقار دِسك، منصة تساعد المكاتب العقارية على إدارة العقارات والعروض والملاك والعملاء من مكان واحد.",
    },
    testimonials: {
      title: "آراء وتجارب العملاء",
      description:
        "اطّلع على تجارب العملاء مع عقار دِسك في تنظيم إدارة العقارات والعروض والتواصل مع العملاء.",
    },
    support: {
      title: "الدعم والمساعدة",
      description:
        "تواصل مع فريق عقار دِسك للحصول على المساعدة بشأن العقارات والعروض وإدارة مكتبك.",
    },
    terms: {
      title: "شروط الاستخدام",
      description:
        "راجع شروط وأحكام استخدام منصة عقار دِسك والخدمات المتاحة عبر الموقع.",
    },
    privacy: {
      title: "سياسة الخصوصية",
      description:
        "اقرأ عن كيفية تعامل عقار دِسك مع المعلومات والبيانات الشخصية عند استخدام الموقع.",
    },
  },
  en: {
    home: {
      title: "Real Estate and Property Management",
      description:
        "AqarDesk helps real estate offices organize properties, listings, owners, and customers in one place.",
      keywords: [
        "real estate management",
        "property management software",
        "real estate office software",
        "property listings",
        "AqarDesk",
      ],
    },
    about: {
      title: "About AqarDesk",
      description:
        "Learn how AqarDesk helps real estate offices manage properties, listings, owners, and customer relationships.",
    },
    testimonials: {
      title: "Customer Stories",
      description:
        "Read customer stories about organizing property management, listings, and real estate customer service with AqarDesk.",
    },
    support: {
      title: "AqarDesk Support",
      description:
        "Contact the AqarDesk team for help with property listings, real estate workflows, and your account.",
    },
    terms: {
      title: "Terms of Use",
      description:
        "Review the terms and conditions for using the AqarDesk website and services.",
    },
    privacy: {
      title: "Privacy Policy",
      description:
        "Learn how AqarDesk handles personal information when you use the website and services.",
    },
  },
} satisfies Record<
  AppLocale,
  Record<
    "home" | "about" | "testimonials" | "support" | "terms" | "privacy",
    { title: string; description: string; keywords?: string[] }
  >
>

export type MarketingPage = keyof (typeof pageCopy)["ar"]

export function getMarketingPageCopy(
  page: MarketingPage,
  locale: AppLocale
) {
  return pageCopy[locale][page]
}

type PageMetadataOptions = {
  title: string
  description: string
  path: string
  locale: AppLocale
  ogImagePath?: string
  og?: { title: string; description: string }
  keywords?: string[]
  type?: "website" | "article"
  canonical?: boolean
  noindex?: boolean
}

export function createPageMetadata(opts: PageMetadataOptions): Metadata {
  const path = opts.path.startsWith("/") ? opts.path : `/${opts.path}`
  const localizedPath = `/${opts.locale}${path === "/" ? "" : path}`
  const url = getSiteUrl(localizedPath)
  const ogTitle = opts.og?.title ?? opts.title
  const ogDesc = opts.og?.description ?? opts.description
  const imageParams = new URLSearchParams({ title: ogTitle })
  if (ogDesc) imageParams.set("description", ogDesc)
  const imageUrl = opts.ogImagePath
    ? getSiteUrl(`/${opts.locale}${opts.ogImagePath}`)
    : getSiteUrl(`/api/og?${imageParams.toString()}`)
  const images = [{ url: imageUrl, width: 1200, height: 630, alt: ogTitle }]

  return {
    title: opts.title,
    description: opts.description,
    ...(opts.keywords && { keywords: opts.keywords }),
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      type: opts.type ?? "website",
      siteName: "AqarDesk",
      locale: opts.locale === "ar" ? "ar_SA" : "en_US",
      url,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDesc,
      images,
    },
    ...(opts.canonical !== false && {
      alternates: {
        canonical: url,
        languages: {
          ar: getSiteUrl(`/ar${path === "/" ? "" : path}`),
          en: getSiteUrl(`/en${path === "/" ? "" : path}`),
          "x-default": getSiteUrl(`/ar${path === "/" ? "" : path}`),
        },
      },
    }),
    ...(opts.noindex && {
      robots: { index: false, follow: true },
    }),
  }
}

export function createSafeJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
