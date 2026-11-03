import { Button } from "@aqardesk/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aqardesk/ui/select"
import { addTeamMemberAction, removeTeamMemberAction } from "@/actions/teams"

type Member = {
  userId: string
  name: string | null
  email: string
  role: string
  joinedAt: Date
}

type AvailableUser = {
  id: string
  name: string
  email: string
}

type Props = {
  teamId: string
  members: Member[]
  availableUsers: AvailableUser[]
  canManage: boolean
  locale: string
}

export function TeamMembers({
  teamId,
  members,
  availableUsers,
  canManage,
  locale,
}: Props) {
  const isArabic = locale === "ar"

  return (
    <div className="space-y-6">
      {canManage && availableUsers.length > 0 && (
        <form
          action={addTeamMemberAction}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input type="hidden" name="teamId" value={teamId} />
          <label className="sr-only" htmlFor="team-member-user">
            {isArabic ? "حساب عضو الفريق" : "Team member account"}
          </label>
          <Select
            name="userId"
            required
            items={availableUsers.map((user) => ({
              value: user.id,
              label: `${user.name} (${user.email})`,
            }))}
          >
            <SelectTrigger
              id="team-member-user"
              className="h-10 min-w-0 flex-1 bg-background text-sm"
            >
              <SelectValue
                placeholder={
                  isArabic
                    ? "اختر حسابًا مسجلًا"
                    : "Select an existing account"
                }
              />
            </SelectTrigger>
            <SelectContent align="start">
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">{isArabic ? "إضافة عضو" : "Add member"}</Button>
        </form>
      )}

      {members.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {isArabic
            ? "لا يوجد أعضاء في هذا الفريق."
            : "This team has no members."}
        </p>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {member.name || member.email}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.email}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {member.role === "lead"
                    ? isArabic
                      ? "قائد الفريق"
                      : "Team lead"
                    : isArabic
                      ? "عضو"
                      : "Member"}
                </span>
                {canManage && member.role !== "lead" && (
                  <form action={removeTeamMemberAction}>
                    <input type="hidden" name="teamId" value={teamId} />
                    <input type="hidden" name="userId" value={member.userId} />
                    <Button type="submit" variant="outline" size="sm">
                      {isArabic ? "إزالة" : "Remove"}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
