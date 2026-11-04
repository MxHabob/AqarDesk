"use client"

import { Button } from "@aqardesk/ui/components/button"
import { Input } from "@aqardesk/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@aqardesk/ui/components/table"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  createUserInvitationAction,
  resendUserInvitationAction,
  revokeUserInvitationAction,
} from "@/actions/user-invitations"
import type { UserRoleOption } from "@/components/forms/user-form"
import {
  ManagementForm,
  ManagementSheet,
} from "@/components/sheets/management-sheet"
import { useScopedI18n } from "@/locales/client"

export type ManagedInvitation = {
  id: string
  name: string
  email: string
  userId: string
  expiresAt: string
  acceptedAt: string | null
  revokedAt: string | null
  createdAt: string
  roles: Array<{ id: string; name: string }>
}

export function UserInvitations({
  invitations,
  roles,
  locale,
}: {
  invitations: ManagedInvitation[]
  roles: UserRoleOption[]
  locale: string
}) {
  const t = useScopedI18n("invitationManagement")
  const common = useScopedI18n("common")
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function getStatus(invitation: ManagedInvitation) {
    if (invitation.acceptedAt) return t("accepted")
    if (invitation.revokedAt) return t("revoked")
    if (new Date(invitation.expiresAt) <= new Date()) return t("expired")
    return t("pending")
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Button type="button" onClick={() => setOpen(true)}>
          {t("inviteUser")}
        </Button>
      </header>
      <div className="overflow-x-auto border-y border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("roles")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("expiresAt")}</TableHead>
              <TableHead className="text-end">{common("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => {
              const isPending =
                !invitation.acceptedAt &&
                !invitation.revokedAt &&
                new Date(invitation.expiresAt) > new Date()
              return (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">
                    {invitation.name}
                  </TableCell>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {invitation.roles.map((role) => (
                        <span
                          key={role.id}
                          className="border border-border px-2 py-1 text-xs"
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{getStatus(invitation)}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                    }).format(new Date(invitation.expiresAt))}
                  </TableCell>
                  <TableCell>
                    {isPending && (
                      <div className="flex justify-end gap-2">
                        <InvitationAction
                          id={invitation.id}
                          label={t("resend")}
                          action={resendUserInvitationAction}
                        />
                        <InvitationAction
                          id={invitation.id}
                          label={t("revoke")}
                          action={revokeUserInvitationAction}
                          destructive
                          confirmMessage={t("confirmRevoke")}
                        />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {invitations.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {t("empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ManagementSheet
        open={open}
        onOpenChange={setOpen}
        title={t("inviteUser")}
        description={t("inviteDescription")}
      >
        <ManagementForm
          action={createUserInvitationAction}
          submitLabel={t("sendInvitation")}
          onSuccess={() => {
            setOpen(false)
            router.refresh()
          }}
        >
          <input type="hidden" name="locale" value={locale} />
          <label htmlFor="invitation-name" className="block space-y-2 text-sm">
            <span>{t("name")}</span>
            <Input
              id="invitation-name"
              name="name"
              required
              minLength={2}
              maxLength={100}
            />
          </label>
          <label htmlFor="invitation-email" className="block space-y-2 text-sm">
            <span>{t("email")}</span>
            <Input
              id="invitation-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">{t("roles")}</legend>
            {roles.map((role) => (
              <label
                key={role.id}
                className="flex items-center gap-2 border border-border px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="roleIds"
                  value={role.id}
                  className="size-4 accent-primary"
                />
                <span>{role.name}</span>
                <span className="ms-auto text-xs text-muted-foreground">
                  {role.key}
                </span>
              </label>
            ))}
          </fieldset>
        </ManagementForm>
      </ManagementSheet>
    </section>
  )
}

function InvitationAction({
  id,
  label,
  action,
  destructive = false,
  confirmMessage,
}: {
  id: string
  label: string
  action: (formData: FormData) => Promise<void>
  destructive?: boolean
  confirmMessage?: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  async function submit() {
    if (confirmMessage && !window.confirm(confirmMessage)) return
    setPending(true)
    setError("")
    const formData = new FormData()
    formData.set("id", id)
    try {
      await action(formData)
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Action failed.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="text-end">
      <Button
        type="button"
        size="sm"
        variant={destructive ? "destructive" : "outline"}
        disabled={pending}
        onClick={() => void submit()}
      >
        {pending ? "…" : label}
      </Button>
      {error && (
        <p role="alert" className="mt-1 max-w-48 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
