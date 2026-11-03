"use client"

import Image from "next/image"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import {
  defaultTestimonials,
  localizeTestimonial,
} from "./sections/testimonials-data"

function renderStructuredContent(content: string) {
  const sections = content.split("\n\n")

  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) => {
        const [label, ...lines] = section.split("\n")
        const hasLabel = lines.length > 0

        return (
          <div className="flex flex-col gap-2" key={section.slice(0, 40)}>
            {hasLabel && (
              <p className="font-sans text-sm font-medium text-foreground">
                {label}
              </p>
            )}
            <p className="font-sans text-sm leading-relaxed text-muted-foreground">
              {hasLabel ? lines.join("\n") : label}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export function Testimonials() {
  const locale = useCurrentLocale()
  const t = useScopedI18n("site")
  const testimonials = defaultTestimonials.map((testimonial) =>
    localizeTestimonial(testimonial, locale)
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background pt-32 pb-24">
        <div className="mx-auto mb-16 max-w-[1400px] px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 font-serif text-3xl text-foreground lg:text-4xl">
              {t("testimonialsTitle")}
            </h1>
            <p className="mb-8 font-sans text-base leading-normal text-muted-foreground">
              {t("testimonialsDescription")}
            </p>
            <p
              className="mb-8 font-sans text-xs leading-5 text-muted-foreground"
              role="note"
            >
              {t("testimonialsDemoNotice")}
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-[1400px]">
          <div className="h-px w-full border-t border-border" />
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 pb-12 sm:px-6 sm:pb-16 lg:pb-24">
        <div className="space-y-16 sm:space-y-20 lg:space-y-24">
          {testimonials.map((testimonial, index) => (
            <article
              className={
                index === 0
                  ? ""
                  : "border-t border-border pt-12 sm:pt-16 lg:pt-20"
              }
              key={`testimonial-${testimonial.name}`}
            >
              <div className="mx-auto max-w-3xl space-y-8 sm:space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    {testimonial.image && (
                      <Image
                        alt={testimonial.name}
                        className="size-10 shrink-0 rounded-full object-cover grayscale"
                        height={40}
                        src={testimonial.image}
                        width={40}
                      />
                    )}
                    <div className="flex flex-col gap-1">
                      <h2 className="font-sans text-base font-medium text-foreground sm:text-lg">
                        {testimonial.name}
                      </h2>
                      <p className="font-sans text-sm text-muted-foreground">
                        {testimonial.company}
                        {testimonial.country && (
                          <span className="text-muted-foreground/70">
                            {" "}
                            · {testimonial.country}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <blockquote
                    className="font-sans text-lg leading-normal text-foreground sm:text-xl sm:leading-relaxed lg:text-2xl"
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    &ldquo;{testimonial.content}&rdquo;
                  </blockquote>
                </div>

                <div className="h-px w-full border-t border-border" />

                {renderStructuredContent(testimonial.fullContent)}

                {testimonial.video && (
                  <div className="w-full overflow-hidden border border-border bg-muted">
                    <video
                      className="h-auto w-full"
                      controls
                      playsInline
                      preload="metadata"
                      poster={testimonial.videoPoster}
                    >
                      <source src={testimonial.video} />
                      <track kind="captions" />
                      {t("videoUnsupported")}
                    </video>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
