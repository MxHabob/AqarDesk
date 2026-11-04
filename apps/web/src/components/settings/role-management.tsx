"use client"

import { Button } from "@aqardesk/ui/button"
import { Input } from "@aqardesk/ui/input"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { deleteRoleAction, saveRoleAction } from "@/actions/role-management"
import { useScopedI18n } from "@/locales/client"
import { ManagementForm, ManagementSheet } from "../sheets/management-sheet"

type Permission = { id: string; key: string }
type Role = {
  id: string
  key: string
  name: string
  description: string | null
  permissionIds: string[]
}

const builtInRoleKeys = new Set([
  "admin",
  "customer",
  "manager",
  "staff",
  "viewer",
])

function PermissionSelector({
  permissions,
  selectedIds,
}: {
  permissions: Permission[]
  selectedIds: string[]
}) {
  const t = useScopedI18n("accessManagement")
  const resources: Record<string, string> = {
    properties: t("resourceProperties"),
    listings: t("resourceListings"),
    owners: t("resourceOwners"),
    teams: t("resourceTeams"),
    users: t("resourceUsers"),
    roles: t("resourceRoles"),
    media: t("resourceMedia"),
    favorites: t("resourceFavorites"),
    audit: t("resourceAudit"),
    office_settings: t("resourceOfficeSettings"),
  }
  const actions: Record<string, string> = {
    read: t("actionRead"),
    create: t("actionCreate"),
    update: t("actionUpdate"),
    delete: t("actionDelete"),
    archive: t("actionArchive"),
    publish: t("actionPublish"),
    close: t("actionClose"),
    share: t("actionShare"),
    manage: t("actionManage"),
  }
  const groups = permissions.reduce<Map<string, Permission[]>>(
    (result, permission) => {
      const resource = permission.key.split(".")[0] ?? "other"
      const group = result.get(resource) ?? []
      group.push(permission)
      result.set(resource, group)
      return result
    },
    new Map()
  )

  if (permissions.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("noPermissions")}</p>
  }

  return (
    <fieldset className="space-y-4">
      <legend className="mb-2 text-sm font-medium">
        {t("selectPermissions")}
      </legend>
      {Array.from(groups, ([resource, group]) => (
        <div key={resource} className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">
            {resources[resource] ?? resource}
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.map((permission) => {
              const action = permission.key.split(".")[1] ?? permission.key
              return (
                <label
                  key={permission.id}
                  className="flex items-center gap-2 border border-border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="permissionIds"
                    value={permission.id}
                    defaultChecked={selectedIds.includes(permission.id)}
                    className="size-4 accent-primary"
                  />
                  <span>{actions[action] ?? action}</span>
                  <span className="ms-auto text-xs text-muted-foreground">
                    {permission.key}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      ))}
    </fieldset>
  )
}

function RoleForm({
  role,
  permissions,
  onSuccess,
}: {
  role?: Role
  permissions: Permission[]
  onSuccess: () => void
}) {
  const t = useScopedI18n("accessManagement")
  const prefix = `role-${role?.id ?? "new"}`

  return (
    <ManagementForm
      action={saveRoleAction}
      onSuccess={onSuccess}
      submitLabel={t("saveRole")}
    >
      {role && <input type="hidden" name="id" value={role.id} />}
      <label htmlFor={`${prefix}-key`} className="block space-y-2 text-sm">
        <span>{t("roleKey")}</span>
        <Input
          id={`${prefix}-key`}
          name="key"
          required
          minLength={2}
          maxLength={64}
          pattern="[a-z][a-z0-9._-]*"
          readOnly={Boolean(role)}
          defaultValue={role?.key ?? ""}
          placeholder="property_manager"
        />
      </label>
      <label htmlFor={`${prefix}-name`} className="block space-y-2 text-sm">
        <span>{t("roleName")}</span>
        <Input
          id={`${prefix}-name`}
          name="name"
          required
          minLength={2}
          maxLength={100}
          defaultValue={role?.name ?? ""}
        />
      </label>
      <label
        htmlFor={`${prefix}-description`}
        className="block space-y-2 text-sm"
      >
        <span>{t("roleDescription")}</span>
        <textarea
          id={`${prefix}-description`}
          name="description"
          maxLength={500}
          rows={2}
          defaultValue={role?.description ?? ""}
          className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </label>
      <PermissionSelector
        permissions={permissions}
        selectedIds={role?.permissionIds ?? []}
      />
    </ManagementForm>
  )
}

function RoleRow({
  role,
  permissions,
  onSaved,
}: {
  role: Role
  permissions: Permission[]
  onSaved: () => void
}) {
  const t = useScopedI18n("accessManagement")
  const common = useScopedI18n("common")
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const isBuiltIn = builtInRoleKeys.has(role.key)
  const permissionNames = permissions
    .filter((permission) => role.permissionIds.includes(permission.id))
    .map((permission) => permission.key)

  return (
    <article className="flex flex-col gap-3 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium">{role.name}</p>
        <p className="text-xs text-muted-foreground">{role.key}</p>
        {role.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {role.description}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setDetailsOpen(true)}
        >
          {t("details")}
        </Button>
        <Button type="button" onClick={() => setEditOpen(true)}>
          {t("edit")}
        </Button>
      </div>
      <ManagementSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        title={t("roleDetails")}
        description={role.name}
      >
        <dl className="divide-y divide-border border-y border-border">
          <div className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
            <dt className="text-sm text-muted-foreground">{t("roleKey")}</dt>
            <dd className="text-sm">{role.key}</dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
            <dt className="text-sm text-muted-foreground">
              {t("roleDescription")}
            </dt>
            <dd className="text-sm">
              {role.description || common("notAvailable")}
            </dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
            <dt className="text-sm text-muted-foreground">
              {t("selectPermissions")}
            </dt>
            <dd className="flex flex-wrap gap-2">
              {permissionNames.map((permission) => (
                <span
                  key={permission}
                  className="border border-border px-2 py-1 text-xs"
                >
                  {permission}
                </span>
              ))}
            </dd>
          </div>
        </dl>
        {isBuiltIn && (
          <p className="mt-4 text-xs text-muted-foreground">
            {t("builtInRole")}
          </p>
        )}
      </ManagementSheet>
      <ManagementSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        title={t("editRole")}
        description={role.name}
      >
        <RoleForm
          role={role}
          permissions={permissions}
          onSuccess={() => {
            setEditOpen(false)
            onSaved()
          }}
        />
        {!isBuiltIn && (
          <div className="mt-5 border-t border-border pt-4">
            <ManagementForm
              action={deleteRoleAction}
              onSuccess={() => {
                setEditOpen(false)
                onSaved()
              }}
              submitLabel={t("deleteRole")}
              confirmMessage={t("confirmDeleteRole")}
              variant="destructive"
              compact
            >
              <input type="hidden" name="id" value={role.id} />
            </ManagementForm>
          </div>
        )}
      </ManagementSheet>
    </article>
  )
}

export function RoleManagement({
  roles,
  permissions,
}: {
  roles: Role[]
  permissions: Permission[]
}) {
  const t = useScopedI18n("accessManagement")
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("rolesTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("rolesDescription")}
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          {t("newRole")}
        </Button>
      </header>
      <ManagementSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={t("newRole")}
      >
        <RoleForm
          permissions={permissions}
          onSuccess={() => {
            setCreateOpen(false)
            router.refresh()
          }}
        />
      </ManagementSheet>
      {roles.length === 0 ? (
        <p className="border-y border-border py-10 text-center text-sm text-muted-foreground">
          {t("noRoles")}
        </p>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {roles.map((role) => (
            <RoleRow
              key={role.id}
              role={role}
              permissions={permissions}
              onSaved={() => router.refresh()}
            />
          ))}
        </div>
      )}
    </section>
  )
}
