"use client"

import { Button } from "@aqardesk/ui/components/button"
import { Checkbox } from "@aqardesk/ui/components/checkbox"
import type { ColumnDef } from "@tanstack/react-table"
import type { ManagedUser, UserRoleOption } from "@/components/forms/user-form"

export type UserColumnLabels = {
  name: string
  email: string
  roles: string
  noRole: string
  emailVerified: string
  verified: string
  unverified: string
  twoFactor: string
  enabled: string
  disabled: string
  locale: string
  arabic: string
  english: string
  timezone: string
  automaticTimezone: string
  dateFormat: string
  timeFormat: string
  time12: string
  time24: string
  weekStartsOnMonday: string
  image: string
  notAvailable: string
  createdAt: string
  updatedAt: string
  actions: string
  details: string
  edit: string
  currentUser: string
  selectAll: string
  selectRow: string
}

function UserActionsCell({
  user,
  onDetails,
  onEdit,
  labels,
}: {
  user: ManagedUser
  onDetails: (user: ManagedUser) => void
  onEdit: (user: ManagedUser) => void
  labels: Pick<UserColumnLabels, "details" | "edit">
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={(event) => {
          event.stopPropagation()
          onDetails(user)
        }}
      >
        {labels.details}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={(event) => {
          event.stopPropagation()
          onEdit(user)
        }}
      >
        {labels.edit}
      </Button>
    </div>
  )
}

export function getUsersColumns({
  currentUserId,
  locale,
  roles,
  onDetails,
  onEdit,
  labels,
}: {
  currentUserId: string
  locale: string
  roles: UserRoleOption[]
  onDetails: (user: ManagedUser) => void
  onEdit: (user: ManagedUser) => void
  labels: UserColumnLabels
}): ColumnDef<ManagedUser>[] {
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return [
    {
      id: "select",
      size: 50,
      minSize: 50,
      maxSize: 50,
      enableResizing: false,
      enableHiding: false,
      enableSorting: false,
      meta: {
        sticky: true,
        className:
          "w-[50px] min-w-[50px] md:sticky md:start-0 bg-background group-hover:bg-[#F2F1EF] group-hover:dark:bg-[#0f0f0f] z-20",
      },
      header: ({ table }) => (
        <Checkbox
          aria-label={labels.selectAll}
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onCheckedChange={(checked) =>
            table.toggleAllPageRowsSelected(checked === true)
          }
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={`${labels.selectRow} ${row.original.name}`}
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(checked) => row.toggleSelected(checked === true)}
        />
      ),
    },
    {
      accessorKey: "name",
      header: labels.name,
      size: 220,
      minSize: 180,
      meta: {
        sticky: true,
        className:
          "md:sticky md:start-[var(--stick-left)] bg-background group-hover:bg-[#F2F1EF] group-hover:dark:bg-[#0f0f0f] z-10",
      },
      cell: ({ row, getValue }) => (
        <span className="font-medium">
          {getValue<string>()}
          {row.original.id === currentUserId && (
            <span className="ms-2 text-xs text-muted-foreground">
              ({labels.currentUser})
            </span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: labels.email,
      size: 250,
      minSize: 190,
      cell: ({ getValue }) => (
        <span className="truncate">{getValue<string>()}</span>
      ),
    },
    {
      id: "roles",
      accessorFn: (user) =>
        roles
          .filter((role) => user.roleIds.includes(role.id))
          .map((role) => role.name)
          .join(", "),
      header: labels.roles,
      size: 200,
      minSize: 150,
      cell: ({ getValue }) =>
        getValue<string>() || (
          <span className="text-muted-foreground">{labels.noRole}</span>
        ),
    },
    {
      accessorKey: "emailVerified",
      header: labels.emailVerified,
      size: 140,
      minSize: 120,
      cell: ({ getValue }) =>
        getValue<boolean>() ? labels.verified : labels.unverified,
    },
    {
      accessorKey: "twoFactorEnabled",
      header: labels.twoFactor,
      size: 170,
      minSize: 140,
      cell: ({ getValue }) =>
        getValue<boolean>() ? labels.enabled : labels.disabled,
    },
    {
      accessorKey: "locale",
      header: labels.locale,
      size: 120,
      minSize: 100,
      cell: ({ getValue }) =>
        getValue<string>() === "ar" ? labels.arabic : labels.english,
    },
    {
      accessorKey: "timezone",
      header: labels.timezone,
      size: 170,
      minSize: 140,
    },
    {
      accessorKey: "timezoneAutoSync",
      header: labels.automaticTimezone,
      size: 200,
      minSize: 160,
      cell: ({ getValue }) =>
        getValue<boolean>() ? labels.enabled : labels.disabled,
    },
    {
      accessorKey: "dateFormat",
      header: labels.dateFormat,
      size: 150,
      minSize: 120,
    },
    {
      accessorKey: "timeFormat",
      header: labels.timeFormat,
      size: 120,
      minSize: 100,
      cell: ({ getValue }) =>
        getValue<number>() === 12 ? labels.time12 : labels.time24,
    },
    {
      accessorKey: "weekStartsOnMonday",
      header: labels.weekStartsOnMonday,
      size: 190,
      minSize: 160,
      cell: ({ getValue }) =>
        getValue<boolean>() ? labels.enabled : labels.disabled,
    },
    {
      accessorKey: "image",
      header: labels.image,
      size: 250,
      minSize: 180,
      cell: ({ getValue }) => (
        <span className="truncate">
          {getValue<string | null>() || labels.notAvailable}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: labels.createdAt,
      size: 170,
      minSize: 140,
      cell: ({ getValue }) =>
        dateFormatter.format(new Date(getValue<string>())),
    },
    {
      accessorKey: "updatedAt",
      header: labels.updatedAt,
      size: 170,
      minSize: 140,
      cell: ({ getValue }) =>
        dateFormatter.format(new Date(getValue<string>())),
    },
    {
      id: "actions",
      header: labels.actions,
      enableSorting: false,
      enableHiding: false,
      meta: { sticky: true },
      size: 150,
      minSize: 140,
      cell: ({ row }) => (
        <UserActionsCell
          user={row.original}
          onDetails={onDetails}
          onEdit={onEdit}
          labels={{ details: labels.details, edit: labels.edit }}
        />
      ),
    },
  ]
}
