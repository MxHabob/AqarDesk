"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/card"
import { useQuery } from "@tanstack/react-query"
import { getUserTeamsAction } from "@/actions/teams"
import { CopyInput } from "@/components/copy-input"

export function TeamIdSection() {
  const { data } = useQuery({
    queryKey: ["user-teams"],
    queryFn: getUserTeamsAction,
  })
  const team = data?.teams.find((item) => item.id === data.selectedTeamId)

  if (!team?.id) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team ID</CardTitle>
        <CardDescription>
          This is your team's unique identifier within AqarDesk.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <CopyInput value={team.id} />
      </CardContent>

      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Used when interacting with the AqarDesk API.
        </p>
      </CardFooter>
    </Card>
  )
}
