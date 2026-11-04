"use client"

import { Input } from "@aqardesk/ui/input"
import { useScopedI18n } from "@/locales/client"

export type UserRoleOption = {
  id: string
  key: string
  name: string
}

export type ManagedUser = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  twoFactorEnabled: boolean
  image: string | null
  locale: string
  timezone: string
  timezoneAutoSync: boolean
  dateFormat: string
  timeFormat: number
  weekStartsOnMonday: boolean
  createdAt: string
  updatedAt: string
  roleIds: string[]
}

export function UserFields({
  user,
  roles,
  locale,
}: {
  user?: ManagedUser
  roles: UserRoleOption[]
  locale: string
}) {
  const t = useScopedI18n("accessManagement")
  const prefix = user ? `user-${user.id}` : "new-user"
  const selectedRoleIds =
    user?.roleIds ??
    roles.filter((role) => role.key === "customer").map((role) => role.id)

  return (
    <>
      {user && <input type="hidden" name="id" value={user.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <label htmlFor={`${prefix}-name`} className="space-y-2 text-sm">
          <span>{t("name")}</span>
          <Input
            id={`${prefix}-name`}
            name="name"
            required
            minLength={2}
            maxLength={100}
            defaultValue={user?.name}
          />
        </label>
        <label htmlFor={`${prefix}-email`} className="space-y-2 text-sm">
          <span>{t("email")}</span>
          <Input
            id={`${prefix}-email`}
            type="email"
            name="email"
            required
            autoComplete="email"
            maxLength={254}
            defaultValue={user?.email}
          />
        </label>
        <label htmlFor={`${prefix}-locale`} className="space-y-2 text-sm">
          <span>{t("locale")}</span>
          <select
            id={`${prefix}-locale`}
            name="locale"
            defaultValue={user?.locale ?? locale}
            className="h-10 w-full border border-input bg-background px-3 text-sm"
          >
            <option value="ar">{t("arabic")}</option>
            <option value="en">{t("english")}</option>
          </select>
        </label>
        <label htmlFor={`${prefix}-timezone`} className="space-y-2 text-sm">
          <span>{t("timezone")}</span>
          <Input
            id={`${prefix}-timezone`}
            name="timezone"
            required
            maxLength={100}
            defaultValue={user?.timezone ?? "Asia/Riyadh"}
            placeholder="Asia/Riyadh"
          />
        </label>
        <label htmlFor={`${prefix}-date-format`} className="space-y-2 text-sm">
          <span>{t("dateFormat")}</span>
          <Input
            id={`${prefix}-date-format`}
            name="dateFormat"
            required
            maxLength={32}
            defaultValue={user?.dateFormat ?? "dd/MM/yyyy"}
          />
        </label>
        <label htmlFor={`${prefix}-time-format`} className="space-y-2 text-sm">
          <span>{t("timeFormat")}</span>
          <select
            id={`${prefix}-time-format`}
            name="timeFormat"
            defaultValue={String(user?.timeFormat ?? 24)}
            className="h-10 w-full border border-input bg-background px-3 text-sm"
          >
            <option value="24">{t("time24")}</option>
            <option value="12">{t("time12")}</option>
          </select>
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            name="emailVerified"
            defaultChecked={user?.emailVerified ?? false}
            className="size-4 accent-primary"
          />
          {t("emailVerified")}
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            name="timezoneAutoSync"
            defaultChecked={user?.timezoneAutoSync ?? true}
            className="size-4 accent-primary"
          />
          {t("automaticTimezone")}
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            name="weekStartsOnMonday"
            defaultChecked={user?.weekStartsOnMonday ?? true}
            className="size-4 accent-primary"
          />
          {t("weekStartsOnMonday")}
        </label>
      </div>
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">{t("roles")}</legend>
        {roles.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noRoles")}</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {roles.map((role) => (
              <label
                key={role.id}
                className="flex items-center gap-2 border border-border px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="roleIds"
                  value={role.id}
                  defaultChecked={selectedRoleIds.includes(role.id)}
                  className="size-4 accent-primary"
                />
                <span>{role.name}</span>
                <span className="ms-auto text-xs text-muted-foreground">
                  {role.key}
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>
    </>
  )
}
