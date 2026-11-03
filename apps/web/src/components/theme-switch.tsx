"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aqardesk/ui/select"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useI18n } from "@/locales/client"

type Theme = "dark" | "system" | "light"

type Props = {
  currentTheme?: Theme
}

const ThemeIcon = ({ currentTheme }: Props) => {
  switch (currentTheme) {
    case "dark":
      return <Moon size={12} />
    case "system":
      return <Monitor size={12} />
    default:
      return <Sun size={12} />
  }
}

export const ThemeSwitch = () => {
  const t = useI18n()
  const { theme, setTheme, themes, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="h-[24px]" />
  }

  return (
    <div className="flex items-center relative">
      <Select
        value={theme}
        onValueChange={(value) => {
          if (value === "dark" || value === "system" || value === "light") {
            setTheme(value)
          }
        }}
      >
        <SelectTrigger className="w-full ps-6 pe-3 py-0.5 bg-transparent outline-none capitalize h-[24px] text-xs border-0 shadow-none">
          <SelectValue placeholder={t("accountSettings.themePlaceholder")}>
            {theme === "light"
              ? t("accountSettings.themeLight")
              : theme === "dark"
                ? t("accountSettings.themeDark")
                : theme === "system"
                  ? t("accountSettings.themeSystem")
                  : t("accountSettings.themePlaceholder")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {themes.map((theme) => (
              <SelectItem
                key={theme}
                value={theme}
                className="capitalize text-xs"
              >
                {theme === "light"
                  ? t("accountSettings.themeLight")
                  : theme === "dark"
                    ? t("accountSettings.themeDark")
                    : theme === "system"
                      ? t("accountSettings.themeSystem")
                      : theme}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="absolute start-2 pointer-events-none">
        <ThemeIcon currentTheme={resolvedTheme as Theme} />
      </div>
    </div>
  )
}
