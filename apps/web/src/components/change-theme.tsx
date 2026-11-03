import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/card"
import { ThemeSwitch } from "@/components/theme-switch"

export function ChangeTheme() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case tracking-normal">
          Appearance
        </CardTitle>
        <CardDescription>
          Customize how AqarDesk looks on your device.
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
