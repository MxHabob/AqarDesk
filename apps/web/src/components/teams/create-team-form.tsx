import { Button } from "@aqardesk/ui/button"
import { Input } from "@aqardesk/ui/input"
import { createTeamAction } from "@/actions/teams"
import { useScopedI18n } from "@/locales/client"

export function CreateTeamForm() {
  const t = useScopedI18n("teamManagement")

  return (
    <form action={createTeamAction} className="flex flex-col gap-3 sm:flex-row">
      <Input
        name="name"
        required
        maxLength={100}
        placeholder={t("teamName")}
        aria-label={t("teamName")}
      />
      <Button type="submit">{t("createTeam")}</Button>
    </form>
  )
}
