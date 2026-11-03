import { Button } from "@aqardesk/ui/button"
import { Input } from "@aqardesk/ui/input"
import { createTeamAction } from "@/actions/teams"

export function CreateTeamForm({ locale }: { locale: string }) {
  const isArabic = locale === "ar"

  return (
    <form action={createTeamAction} className="flex flex-col gap-3 sm:flex-row">
      <Input
        name="name"
        required
        maxLength={100}
        placeholder={isArabic ? "اسم الفريق" : "Team name"}
        aria-label={isArabic ? "اسم الفريق" : "Team name"}
      />
      <Button type="submit">{isArabic ? "إنشاء فريق" : "Create team"}</Button>
    </form>
  )
}
