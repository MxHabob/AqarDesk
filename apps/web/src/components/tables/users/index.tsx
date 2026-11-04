"use client"

import { cn } from "@aqardesk/ui/cn"
import { Button } from "@aqardesk/ui/components/button"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@aqardesk/ui/components/table"
import { closestCenter, DndContext } from "@dnd-kit/core"
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type RowSelectionState,
  useReactTable,
} from "@tanstack/react-table"
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual"
import { AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useRef, useState } from "react"
import {
  bulkDeleteManagedUsersAction,
  bulkRevokeManagedUserSessionsAction,
  createManagedUserAction,
  deleteManagedUserAction,
  revokeManagedUserSessionsAction,
  updateManagedUserAction,
} from "@/actions/user-management"
import {
  type ManagedUser,
  UserFields,
  type UserRoleOption,
} from "@/components/forms/user-form"
import {
  ManagementForm,
  ManagementSheet,
} from "@/components/sheets/management-sheet"
import {
  BulkActions,
  TableEmptyState,
  VirtualRow,
} from "@/components/tables/core"
import { DraggableHeader } from "@/components/tables/draggable-header"
import { ResizeHandle } from "@/components/tables/resize-handle"
import { useStickyColumns } from "@/hooks/use-sticky-columns"
import { useTableDnd } from "@/hooks/use-table-dnd"
import { useTableSettings } from "@/hooks/use-table-settings"
import { useScopedI18n } from "@/locales/client"
import { NON_REORDERABLE_COLUMNS, STICKY_COLUMNS } from "@/utils/table-configs"
import { getColumnIds, type TableSettings } from "@/utils/table-settings"
import { getUsersColumns } from "./columns"
import { UsersTableHeader } from "./table-header"

const NON_CLICKABLE_COLUMNS = new Set(["select", "actions"])

function UserDetails({
  user,
  roles,
}: {
  user: ManagedUser
  roles: UserRoleOption[]
}) {
  const t = useScopedI18n("accessManagement")
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
  })
  const userRoles = roles.filter((role) => user.roleIds.includes(role.id))
  const entries: [string, string][] = [
    [t("name"), user.name],
    [t("email"), user.email],
    [t("locale"), user.locale],
    [t("emailVerified"), user.emailVerified ? t("verified") : t("unverified")],
    [t("twoFactor"), user.twoFactorEnabled ? t("enabled") : t("disabled")],
    [t("timezone"), user.timezone],
    [
      t("automaticTimezone"),
      user.timezoneAutoSync ? t("enabled") : t("disabled"),
    ],
    [t("dateFormat"), user.dateFormat],
    [t("timeFormat"), user.timeFormat === 12 ? t("time12") : t("time24")],
    [
      t("weekStartsOnMonday"),
      user.weekStartsOnMonday ? t("enabled") : t("disabled"),
    ],
    [t("createdAt"), dateFormatter.format(new Date(user.createdAt))],
    [t("updatedAt"), dateFormatter.format(new Date(user.updatedAt))],
  ]

  return (
    <dl className="divide-y divide-border border-y border-border">
      {entries.map(([label, value]) => (
        <div key={label} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr]">
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="break-all text-sm">{value}</dd>
        </div>
      ))}
      <div className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr]">
        <dt className="text-sm text-muted-foreground">{t("roles")}</dt>
        <dd className="flex flex-wrap gap-2">
          {userRoles.length > 0
            ? userRoles.map((role) => (
                <span
                  key={role.id}
                  className="border border-border px-2 py-1 text-xs"
                >
                  {role.name}
                </span>
              ))
            : t("noRole")}
        </dd>
      </div>
      {user.image && (
        <div className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr]">
          <dt className="text-sm text-muted-foreground">{t("image")}</dt>
          <dd className="break-all text-sm">{user.image}</dd>
        </div>
      )}
    </dl>
  )
}

export function UsersTable({
  locale,
  query,
  users,
  roles,
  currentUserId,
  page,
  totalPages,
  totalUsers,
  initialSettings,
}: {
  locale: string
  query: string
  users: ManagedUser[]
  roles: UserRoleOption[]
  currentUserId: string
  page: number
  totalPages: number
  totalUsers: number
  initialSettings?: Partial<TableSettings>
}) {
  const t = useScopedI18n("accessManagement")
  const common = useScopedI18n("common")
  const router = useRouter()
  const parentRef = useRef<HTMLDivElement>(null)
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const labels = useMemo(
    () => ({
      name: t("name"),
      email: t("email"),
      roles: t("roles"),
      noRole: t("noRole"),
      emailVerified: t("emailVerified"),
      verified: t("verified"),
      unverified: t("unverified"),
      twoFactor: t("twoFactor"),
      enabled: t("enabled"),
      disabled: t("disabled"),
      locale: t("locale"),
      arabic: t("arabic"),
      english: t("english"),
      timezone: t("timezone"),
      automaticTimezone: t("automaticTimezone"),
      dateFormat: t("dateFormat"),
      timeFormat: t("timeFormat"),
      time12: t("time12"),
      time24: t("time24"),
      weekStartsOnMonday: t("weekStartsOnMonday"),
      image: t("image"),
      notAvailable: t("notAvailable"),
      createdAt: t("createdAt"),
      updatedAt: t("updatedAt"),
      actions: t("actions"),
      details: t("details"),
      edit: t("edit"),
      currentUser: t("currentUser"),
      selectAll: common("selectAll"),
      selectRow: common("selectRow"),
    }),
    [common, t]
  )
  const columns = useMemo(
    () =>
      getUsersColumns({
        currentUserId,
        locale,
        roles,
        labels,
        onDetails: (user) => {
          setSelectedUser(user)
          setDetailsOpen(true)
        },
        onEdit: (user) => {
          setSelectedUser(user)
          setEditOpen(true)
        },
      }),
    [currentUserId, labels, locale, roles]
  )
  const columnIds = useMemo(() => getColumnIds(columns), [columns])
  const {
    columnVisibility,
    setColumnVisibility,
    columnSizing,
    setColumnSizing,
    columnOrder,
    setColumnOrder,
  } = useTableSettings({
    tableId: "users",
    initialSettings,
    columnIds,
  })
  const table = useReactTable({
    data: users,
    columns,
    getRowId: (user) => user.id,
    enableRowSelection: (row) => row.original.id !== currentUserId,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onColumnOrderChange: setColumnOrder,
    state: {
      rowSelection,
      columnVisibility,
      columnSizing,
      columnOrder,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
  const { sensors, handleDragEnd } = useTableDnd(table)
  const { getStickyStyle, getStickyClassName } = useStickyColumns({
    columnVisibility,
    table,
    stickyColumns: STICKY_COLUMNS.users,
  })
  const getRowStickyClassName = useCallback(
    (columnId: string, baseClassName?: string) =>
      columnId === "actions"
        ? cn(
            baseClassName,
            "md:sticky md:end-0 z-10 bg-background group-hover:bg-[#F2F1EF] group-hover:dark:bg-[#0f0f0f]"
          )
        : getStickyClassName(columnId, baseClassName),
    [getStickyClassName]
  )
  const sortableColumnIds = useMemo(
    () =>
      table
        .getAllLeafColumns()
        .filter((column) => !NON_REORDERABLE_COLUMNS.users.has(column.id))
        .map((column) => column.id),
    [table]
  )
  const rows = table.getRowModel().rows
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
    overscan: 10,
  })
  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id)
  const selectedCount = selectedIds.length

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col gap-4 py-6">
      <UsersTableHeader
        query={query}
        locale={locale}
        table={table}
        onCreate={() => setCreateOpen(true)}
      />
      <div
        ref={parentRef}
        className="min-h-0 flex-1 overflow-auto overscroll-contain border-y border-border scrollbar-hide"
      >
        <Table className="w-full min-w-full">
          <TableHeader className="sticky top-0 z-20 block w-full border-0 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="flex h-[45px] min-w-full items-center !border-b-0 hover:bg-transparent"
              >
                <DndContext
                  id="users-table-dnd"
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortableColumnIds}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => {
                      const columnId = header.column.id
                      const isFixed =
                        NON_REORDERABLE_COLUMNS.users.has(columnId)
                      const isActions = columnId === "actions"
                      const meta = header.column.columnDef.meta as
                        | { className?: string }
                        | undefined
                      const style = {
                        width: header.getSize(),
                        minWidth: header.getSize(),
                        ...getStickyStyle(columnId),
                        ...(isActions && {
                          position: "sticky" as const,
                          insetInlineEnd: 0,
                          zIndex: 20,
                        }),
                      }
                      const content = (
                        <>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {header.column.getIsSorted() === "asc"
                            ? " ↑"
                            : header.column.getIsSorted() === "desc"
                              ? " ↓"
                              : null}
                          <ResizeHandle header={header} />
                        </>
                      )

                      return isFixed ? (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "group/header relative flex h-full shrink-0 items-center border-t border-border bg-background px-4",
                            isActions
                              ? "md:sticky md:end-0 z-20"
                              : getStickyClassName(columnId, meta?.className)
                          )}
                          style={style}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {content}
                        </TableHead>
                      ) : (
                        <DraggableHeader
                          key={header.id}
                          id={columnId}
                          style={{ ...style, flexShrink: 0 }}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {content}
                        </DraggableHeader>
                      )
                    })}
                  </SortableContext>
                </DndContext>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody
            className="block border-x-0"
            style={{
              height: `${rows.length ? rowVirtualizer.getTotalSize() : 180}px`,
              position: "relative",
            }}
          >
            {rows.length === 0 ? (
              <TableEmptyState
                title={t("noUsers")}
                description={common("noResults")}
                actionLabel={t("clearSearch")}
                onAction={() => router.push(`/${locale}/dashboard/users`)}
              />
            ) : (
              rowVirtualizer
                .getVirtualItems()
                .map((virtualRow: VirtualItem) => {
                  const row = rows[virtualRow.index]
                  if (!row) return null
                  return (
                    <VirtualRow
                      key={row.id}
                      row={row}
                      virtualStart={virtualRow.start}
                      rowHeight={45}
                      getStickyStyle={getStickyStyle}
                      getStickyClassName={getRowStickyClassName}
                      nonClickableColumns={NON_CLICKABLE_COLUMNS}
                      onCellClick={() => {
                        setSelectedUser(row.original)
                        setDetailsOpen(true)
                      }}
                      columnSizing={columnSizing}
                      columnOrder={columnOrder}
                      columnVisibility={columnVisibility}
                      isSelected={rowSelection[row.id] ?? false}
                    />
                  )
                })
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex shrink-0 items-center justify-between text-xs text-muted-foreground">
        <span>{t("recordCount", { count: totalUsers })}</span>
        <span>
          {t("page")} {page} {t("of")} {totalPages}
        </span>
      </div>
      {totalPages > 1 && (
        <nav className="flex justify-between" aria-label={t("pagination")}>
          {page > 1 ? (
            <Button
              variant="outline"
              size="sm"
              render={
                <a
                  href={`/${locale}/dashboard/users?${new URLSearchParams({
                    ...(query ? { q: query } : {}),
                    page: String(page - 1),
                  })}`}
                >
                  {t("previous")}
                </a>
              }
            />
          ) : (
            <span />
          )}
          {page < totalPages && (
            <Button
              variant="outline"
              size="sm"
              render={
                <a
                  href={`/${locale}/dashboard/users?${new URLSearchParams({
                    ...(query ? { q: query } : {}),
                    page: String(page + 1),
                  })}`}
                >
                  {t("next")}
                </a>
              }
            />
          )}
        </nav>
      )}
      <AnimatePresence>
        {selectedCount > 0 && (
          <BulkActions
            selectedCount={selectedCount}
            selectedLabel={common("selectedRows")}
            deselectLabel={common("deselectAll")}
            onDeselect={() => table.toggleAllRowsSelected(false)}
            onComplete={(result) => {
              setRowSelection(
                Object.fromEntries(
                  (result.failedIds ?? []).map((id) => [id, true])
                )
              )
              router.refresh()
            }}
            actionLabel={t("bulkActions")}
            deleteLabel={t("deleteSelected")}
            deleteTitle={t("confirmDeleteTitle")}
            deleteDescription={t("confirmDeleteDescription", {
              count: selectedCount,
            })}
            deletePrompt={t("typeToConfirm", { keyword: "{keyword}" })}
            confirmationKeyword={t("deleteKeyword")}
            confirmLabel={t("deleteSelected")}
            cancelLabel={common("cancel")}
            successLabel={(actionId, count) =>
              actionId === "delete"
                ? t("usersDeleted", { count })
                : t("sessionsRevoked", { count })
            }
            partialLabel={t("bulkPartial")}
            partialDescription={t("bulkPartialDescription", {
              affected: "{affected}",
              skipped: "{skipped}",
            })}
            cleanupFailedDescription=""
            actionErrorLabel={t("bulkError")}
            actions={[
              { id: "revoke_sessions", label: t("revokeSelectedSessions") },
            ]}
            onAction={async (actionId) =>
              actionId === "delete"
                ? bulkDeleteManagedUsersAction(selectedIds)
                : bulkRevokeManagedUserSessionsAction(selectedIds)
            }
          />
        )}
      </AnimatePresence>
      {selectedUser && (
        <>
          <ManagementSheet
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            title={t("userDetails")}
            description={selectedUser.email}
          >
            <UserDetails user={selectedUser} roles={roles} />
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => {
                  setDetailsOpen(false)
                  setEditOpen(true)
                }}
              >
                {t("edit")}
              </Button>
              {selectedUser.id !== currentUserId && (
                <>
                  <ManagementForm
                    action={revokeManagedUserSessionsAction}
                    onSuccess={() => setDetailsOpen(false)}
                    submitLabel={t("revokeSessions")}
                    confirmMessage={t("confirmRevokeSessions")}
                    variant="outline"
                    compact
                  >
                    <input type="hidden" name="id" value={selectedUser.id} />
                  </ManagementForm>
                  <ManagementForm
                    action={deleteManagedUserAction}
                    onSuccess={() => setDetailsOpen(false)}
                    submitLabel={t("deleteUser")}
                    confirmMessage={t("confirmDeleteUser")}
                    variant="destructive"
                    compact
                  >
                    <input type="hidden" name="id" value={selectedUser.id} />
                  </ManagementForm>
                </>
              )}
            </div>
          </ManagementSheet>
          <ManagementSheet
            open={editOpen}
            onOpenChange={setEditOpen}
            title={t("editUser")}
            description={selectedUser.email}
          >
            <ManagementForm
              action={updateManagedUserAction}
              onSuccess={() => {
                setEditOpen(false)
                router.refresh()
              }}
            >
              <UserFields user={selectedUser} roles={roles} locale={locale} />
            </ManagementForm>
          </ManagementSheet>
        </>
      )}
      <ManagementSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={t("createUser")}
        description={t("createUserDescription")}
      >
        <ManagementForm
          action={createManagedUserAction}
          onSuccess={() => {
            setCreateOpen(false)
            router.refresh()
          }}
        >
          <UserFields locale={locale} roles={roles} />
        </ManagementForm>
      </ManagementSheet>
    </section>
  )
}
