"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { defaultTestimonials } from "@/components/marketing/sections/testimonials-data"

export default function LoginTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((index) => (index + 1) % defaultTestimonials.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  const testimonial = defaultTestimonials[currentIndex]

  if (!testimonial) return null

  return (
    <div
      dir="ltr"
      aria-live="polite"
      className="relative flex min-h-64 items-center justify-center"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={testimonial.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 text-center"
        >
          <motion.p
            initial={{ opacity: 0, filter: "blur(2px)", y: 10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mx-auto max-w-md font-sans text-xl leading-relaxed text-white/85"
          >
            &ldquo;{testimonial.content}&rdquo;
          </motion.p>
          <motion.p
            initial={{ opacity: 0, filter: "blur(2px)", y: 10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="font-sans text-xs text-white/60"
          >
            {testimonial.name}, {testimonial.company} · {testimonial.country}
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
