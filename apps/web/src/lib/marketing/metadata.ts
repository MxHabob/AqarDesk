import type { Metadata } from "next"
import { type AppLocale, locales } from "@/locales/config"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

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
      title: "مكتب علي شوبان | عقارات للبيع والإيجار",
      description:
        "مكتب علي شوبان في اليمن يقدّم خدمات بيع وتأجير العقارات، ويستخدم نظام AqarDesk لتنظيم العروض ومتابعة تفاصيل كل عقار.",
      keywords: [
        "إدارة العقارات",
        "برنامج إدارة مكاتب عقارية",
        "إدارة عروض عقارية",
        "عقارات للبيع والإيجار",
        "مكتب علي شوبان",
      ],
    },
    about: {
      title: "عن مكتب علي شوبان",
      description:
        "تعرّف على مكتب علي شوبان وخدماته العقارية في اليمن، وكيف نستخدم نظام AqarDesk لتنظيم العروض وخدمة عملائنا.",
    },
    services: {
      title: "خدماتنا العقارية",
      description:
        "اكتشف خدمات مكتب علي شوبان في العقارات والاستثمار، والتصميم والاستشارات الهندسية، والمقاولات والمناقصات وتنفيذ أعمال المباني.",
    },
    testimonials: {
      title: "آراء وتجارب العملاء",
      description:
        "اطّلع على تجارب العملاء مع مكتب علي شوبان وخدماتنا في بيع العقارات وتأجيرها ومتابعة العروض.",
    },
    support: {
      title: "الدعم والمساعدة",
      description:
        "تواصل مع مكتب علي شوبان للحصول على المساعدة بشأن العقارات المعروضة وخدمات البيع والتأجير.",
    },
    terms: {
      title: "شروط الاستخدام",
      description:
        "راجع شروط وأحكام استخدام موقع مكتب علي شوبان والخدمات العقارية المتاحة.",
    },
    privacy: {
      title: "سياسة الخصوصية",
      description:
        "اقرأ عن كيفية تعامل مكتب علي شوبان مع المعلومات والبيانات الشخصية عند استخدام الموقع.",
    },
  },
  en: {
    home: {
      title: "Ali Shoban's Office | Real Estate in Yemen",
      description:
        "Ali Shoban's Office provides property sales and rental services in Yemen, using AqarDesk to organize listings and serve clients.",
      keywords: [
        "real estate management",
        "property management software",
        "real estate office software",
        "property listings",
        "Ali Shoban's Office",
      ],
    },
    about: {
      title: "About Ali Shoban's Office",
      description:
        "Learn about Ali Shoban's Office, our real estate services in Yemen, and how we use AqarDesk to organize listings and serve clients.",
    },
    services: {
      title: "Real Estate Services",
      description:
        "Explore Ali Shoban's Office services in property and investment, engineering design, contracting, tenders, and building construction in Yemen.",
    },
    testimonials: {
      title: "Customer Stories",
      description:
        "Read customer stories about buying and renting properties with Ali Shoban's Office.",
    },
    support: {
      title: "Ali Shoban's Office Support",
      description:
        "Contact Ali Shoban's Office for help with available properties, sales, and rentals.",
    },
    terms: {
      title: "Terms of Use",
      description:
        "Review the terms and conditions for using the Ali Shoban's Office website and real estate services.",
    },
    privacy: {
      title: "Privacy Policy",
      description:
        "Learn how Ali Shoban's Office handles personal information when you use the website and services.",
    },
  },
} satisfies Record<
  AppLocale,
  Record<
    | "home"
    | "about"
    | "services"
    | "testimonials"
    | "support"
    | "terms"
    | "privacy",
    { title: string; description: string; keywords?: string[] }
  >
>

export type MarketingPage = keyof (typeof pageCopy)["ar"]

function requireLocale(locale: string): AppLocale {
  const supportedLocale = locales.find((candidate) => candidate === locale)
  if (!supportedLocale) {
    throw new Error(`Unsupported locale: ${locale}`)
  }
  return supportedLocale
}

export function getMarketingPageCopy(page: MarketingPage, locale: string) {
  return pageCopy[requireLocale(locale)][page]
}

type PageMetadataOptions = {
  title: string
  description: string
  path: string
  locale: string
  ogImagePath?: string
  og?: { title: string; description: string }
  keywords?: string[]
  type?: "website" | "article"
  canonical?: boolean
  noindex?: boolean
}

export async function createPageMetadata(
  opts: PageMetadataOptions
): Promise<Metadata> {
  const locale = requireLocale(opts.locale)
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("site")
  const path = opts.path.startsWith("/") ? opts.path : `/${opts.path}`
  const localizedPath = `/${locale}${path === "/" ? "" : path}`
  const url = getSiteUrl(localizedPath)
  const cleanText = (value: string) =>
    value
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  const title = cleanText(opts.title).slice(0, 70).trimEnd()
  const description = cleanText(opts.description).slice(0, 160).trimEnd()
  const ogTitle = cleanText(opts.og?.title ?? title)
    .slice(0, 70)
    .trimEnd()
  const ogDesc = cleanText(opts.og?.description ?? description)
    .slice(0, 160)
    .trimEnd()
  const imageParams = new URLSearchParams({ title: ogTitle })
  if (ogDesc) imageParams.set("description", ogDesc)
  const imageUrl = opts.ogImagePath
    ? getSiteUrl(`/${locale}${opts.ogImagePath}`)
    : getSiteUrl(`/api/og?${imageParams.toString()}`)
  const images = [{ url: imageUrl, width: 1200, height: 630, alt: ogTitle }]

  return {
    title,
    description,
    ...(opts.keywords && { keywords: opts.keywords }),
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      type: opts.type ?? "website",
      siteName: t("officeName"),
      locale: locale === "ar" ? "ar_SA" : "en_US",
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
