"use client"

import { Button } from "@aqardesk/ui/button"
import { Icons } from "@aqardesk/ui/icons"
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
      <Button
        type="submit"
        size="icon"
        aria-label={t("createTeam")}
        title={t("createTeam")}
      >
        <Icons.Add aria-hidden="true" size={20} />
      </Button>
    </form>
  )
}
