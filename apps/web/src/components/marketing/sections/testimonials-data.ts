export type LocalizedTestimonialText = {
  ar: string
  en: string
}

export interface Testimonial {
  name: LocalizedTestimonialText
  title: LocalizedTestimonialText
  company: LocalizedTestimonialText
  country: LocalizedTestimonialText
  content: LocalizedTestimonialText
  fullContent: LocalizedTestimonialText
  image?: string
  video?: string
  videoPoster?: string
}

export type LocalizedTestimonial = Omit<
  Testimonial,
  "name" | "title" | "company" | "country" | "content" | "fullContent"
> & {
  name: string
  title: string
  company: string
  country: string
  content: string
  fullContent: string
}

export function localizeTestimonial(
  testimonial: Testimonial,
  locale: string
): LocalizedTestimonial {
  const language = locale === "ar" ? "ar" : "en"

  return {
    ...testimonial,
    name: testimonial.name[language],
    title: testimonial.title[language],
    company: testimonial.company[language],
    country: testimonial.country[language],
    content: testimonial.content[language],
    fullContent: testimonial.fullContent[language],
  }
}

export const defaultTestimonials: Testimonial[] = [
  {
    name: { ar: "عبدالله الحكيمي", en: "Abdullah Al-Hakimi" },
    title: { ar: "مالك عقار", en: "Property owner" },
    company: { ar: "عميل عقاري", en: "Property client" },
    country: { ar: "اليمن", en: "Yemen" },
    content: {
      ar: "كنت أدور على طريقة أرتّب بها عروض عقاري، والحين صارت التفاصيل واضحة وأسهل للمهتمين.",
      en: "I was looking for a clearer way to organize my property listings. Now the details are easier for interested people to review.",
    },
    fullContent: {
      ar: "التحدي\nكنت أتابع تفاصيل العقار واستفسارات المهتمين بطرق متفرقة.\n\nالتجربة\nعرض العقار بمعلوماته وصوره وموقعه خلّى الرجوع للتفاصيل أيسر.\n\nالأثر\nصار عندي ترتيب أوضح للعروض، والتواصل بخصوصها أسهل.",
      en: "Challenge\nI was keeping track of property details and inquiries in different places.\n\nExperience\nHaving the property's information, photos, and location together made it easier to revisit the details.\n\nImpact\nMy listings feel more organized, and it is easier to follow up about them.",
    },
  },
  {
    name: { ar: "ياسر الصبري", en: "Yasser Al-Sabri" },
    title: { ar: "باحث عن منزل", en: "Home seeker" },
    company: { ar: "عميل عقاري", en: "Property client" },
    country: { ar: "اليمن", en: "Yemen" },
    content: {
      ar: "أريح لي أشوف الخيارات ومواقعها من مكان واحد، بدل ما أتعب وأنا أدوّر وأسأل.",
      en: "It is easier to review options and their locations in one place instead of searching and asking around.",
    },
    fullContent: {
      ar: "التحدي\nكان صعب عليّ أقارن بين العقارات وأتذكر تفاصيل كل واحد.\n\nالتجربة\nالصور والموقع ومعلومات العرض تساعدني أراجع الخيارات بهدوء.\n\nالأثر\nأقدر أضيّق اختياراتي وأتواصل مع المكتب لما أحتاج أسأل عن عقار.",
      en: "Challenge\nIt was hard to compare properties and remember the details of each one.\n\nExperience\nPhotos, locations, and listing details help me review the options at my own pace.\n\nImpact\nI can narrow down my choices and contact the office when I have questions about a property.",
    },
  },
  {
    name: { ar: "أمين الأهدل", en: "Amin Al-Ahdal" },
    title: { ar: "مستأجر", en: "Tenant" },
    company: { ar: "عميل عقاري", en: "Property client" },
    country: { ar: "اليمن", en: "Yemen" },
    content: {
      ar: "كنت محتاج إيجار بمواصفات معيّنة، وتصفّح العروض خلّاني أعرف الموجود قبل ما أتواصل.",
      en: "I needed a rental with specific requirements, and browsing the listings helped me see what was available before getting in touch.",
    },
    fullContent: {
      ar: "التحدي\nكنت أبحث عن عقار للإيجار وما كانت تفاصيل الخيارات واضحة لي.\n\nالتجربة\nاستعراض عروض الإيجار ومواقعها سهّل عليّ أعرف الخيارات المنشورة.\n\nالأثر\nصرت أتواصل مع المكتب وأنا عارف أي عرض أبغى أستفسر عنه.",
      en: "Challenge\nI was looking for a rental and did not have a clear view of the available options.\n\nExperience\nReviewing rental listings and their locations helped me understand what was published.\n\nImpact\nI can contact the office knowing which listing I want to ask about.",
    },
  },
  {
    name: { ar: "نبيل اليافعي", en: "Nabil Al-Yafei" },
    title: { ar: "مستثمر عقاري", en: "Property investor" },
    company: { ar: "عميل عقاري", en: "Property client" },
    country: { ar: "اليمن", en: "Yemen" },
    content: {
      ar: "لما تكون معلومات العقار وموقعه قدامي، المقارنة تصير أوضح وأقدر أناقش الخيارات بشكل أفضل.",
      en: "When a property's information and location are easy to review, I can compare options more clearly and discuss them better.",
    },
    fullContent: {
      ar: "التحدي\nكنت أحتاج أجمع معلومات أكثر من عرض قبل ما أقرر أيها يستحق المتابعة.\n\nالتجربة\nتفاصيل العقار وموقعه وصوره تساعدني أراجع كل خيار.\n\nالأثر\nصار عندي أساس أوضح للمقارنة، وأعرف إيش أسأل عنه لما أتواصل مع المكتب.",
      en: "Challenge\nI needed to gather details from several listings before deciding which ones to follow up on.\n\nExperience\nProperty details, location, and photos help me review each option.\n\nImpact\nI have a clearer basis for comparing options and know what to ask when I contact the office.",
    },
  },
]
