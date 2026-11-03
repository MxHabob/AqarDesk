import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/card"
import { ThemeSwitch } from "@/components/theme-switch"
import { useI18n } from "@/locales/client"

export function ChangeTheme() {
  const t = useI18n()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case tracking-normal">
          {t("accountSettings.appearanceTitle")}
        </CardTitle>
        <CardDescription>
          {t("accountSettings.appearanceDescription")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="w-[240px]">
          <ThemeSwitch />
        </div>
      </CardContent>
    </Card>
  )
}
