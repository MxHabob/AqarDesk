"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

export function ListingsFilterAutoSubmit() {
  const markerRef = useRef<HTMLSpanElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const form = markerRef.current?.closest("form")
    if (!form) return

    let searchTimer: ReturnType<typeof setTimeout> | null = null

    const submitFilters = () => {
      if (searchTimer) {
        clearTimeout(searchTimer)
        searchTimer = null
      }

      const query = new URLSearchParams()
      new FormData(form).forEach((value, name) => {
        if (typeof value !== "string" || !value.trim()) return
        if (name === "propertyType" && value === "all") return
        query.set(name, value)
      })
      query.delete("page")

      const search = query.toString()
      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      })
    }

    const handleChange = (event: Event) => {
      const target = event.target
      if (target instanceof HTMLSelectElement) {
        submitFilters()
        return
      }
      if (!(target instanceof HTMLInputElement)) return
      if (target.type === "number" || target.type === "search") return
      submitFilters()
    }

    const handleInput = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLInputElement) || target.type !== "search") {
        return
      }
      if (searchTimer) clearTimeout(searchTimer)
      searchTimer = setTimeout(submitFilters, 400)
    }

    const handleBlur = (event: FocusEvent) => {
      const target = event.target
      if (!(target instanceof HTMLInputElement) || target.type !== "number") {
        return
      }
      const group = target.closest("fieldset")
      if (
        event.relatedTarget instanceof Node &&
        group?.contains(event.relatedTarget)
      ) {
        return
      }
      submitFilters()
    }

    const handleSubmit = (event: SubmitEvent) => {
      event.preventDefault()
      submitFilters()
    }

    form.addEventListener("change", handleChange)
    form.addEventListener("input", handleInput)
    form.addEventListener("blur", handleBlur, true)
    form.addEventListener("submit", handleSubmit)

    return () => {
      form.removeEventListener("change", handleChange)
      form.removeEventListener("input", handleInput)
      form.removeEventListener("blur", handleBlur, true)
      form.removeEventListener("submit", handleSubmit)
      if (searchTimer) clearTimeout(searchTimer)
    }
  }, [pathname, router])

  return <span ref={markerRef} hidden aria-hidden="true" />
}
