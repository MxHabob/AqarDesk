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
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type RowSelectionState,
  useReactTable,
} from "@tanstack/react-table"
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual"
import { AnimatePresence } from "framer-motion"
import { Download } from "lucide-react"
import { useCallback, useMemo, useRef, useState } from "react"
import {
  bulkDeleteListingsAction,
  bulkUpdateListingStatusAction,
  type getRealEstateBulkCapabilities,
} from "@/actions/real-estate"
import {
  type BulkActionOption,
  BulkActions,
  TableEmptyState,
  VirtualRow,
} from "@/components/tables/core"
import { DraggableHeader } from "@/components/tables/draggable-header"
import { ResizeHandle } from "@/components/tables/resize-handle"
import { useRealEstateParams } from "@/hooks/use-real-estate-params"
import { useStickyColumns } from "@/hooks/use-sticky-columns"
import { useTableDnd } from "@/hooks/use-table-dnd"
import { useTableSettings } from "@/hooks/use-table-settings"
import { useCurrentLocale, useI18n } from "@/locales/client"
import { realEstateQueries } from "@/queries/real-estate"
import { exportTableSelection } from "@/utils/export-table-selection"
import { NON_REORDERABLE_COLUMNS, STICKY_COLUMNS } from "@/utils/table-configs"
import { getColumnIds, type TableSettings } from "@/utils/table-settings"
import { getListingsColumns, type ListingRow } from "./columns"
import { ListingsTableHeader } from "./table-header"

const NON_CLICKABLE_COLUMNS = new Set(["select", "actions"])

function getListingBulkActions(
  rows: ListingRow[],
  capabilities: Awaited<ReturnType<typeof getRealEstateBulkCapabilities>>,
  t: ReturnType<typeof useI18n>
): BulkActionOption[] {
  if (rows.length === 0) return []

  const allSale = rows.every((row) => row.listingType === "sale")
  const allRent = rows.every((row) => row.listingType === "rent")
  const allHavePrice = rows.every((row) =>
    row.listingType === "sale"
      ? row.salePrice !== null
      : row.monthlyRent !== null
  )
  const actions: BulkActionOption[] = []

  if (capabilities.listings.update) {
    actions.push({
      id: "status:draft",
      label: t("realEstateTables.saveAsDraft"),
    })
    if (allHavePrice && capabilities.listings.publish) {
      actions.push({
        id: "status:active",
        label: t("realEstateTables.statusActive"),
      })
    }
    if (allHavePrice) {
      actions.push({
        id: "status:reserved",
        label: t("realEstateTables.statusReserved"),
      })
    }
    if (capabilities.listings.close) {
      if (allSale) {
        actions.push({
          id: "status:sold",
          label: t("realEstateTables.statusSold"),
        })
      }
      if (allRent) {
        actions.push({
          id: "status:rented",
          label: t("realEstateTables.statusRented"),
        })
      }
      actions.push(
        {
          id: "status:expired",
          label: t("realEstateTables.statusExpired"),
        },
        {
          id: "status:withdrawn",
          label: t("realEstateTables.statusWithdrawn"),
        }
      )
    }
  }

  return actions
}

export function ListingsTable({
  initialSettings,
}: {
  initialSettings?: Partial<TableSettings>
}) {
  const { setParams, listingStatus, listingTypeFilter } = useRealEstateParams()
  const locale = useCurrentLocale()
  const t = useI18n()
  const queryClient = useQueryClient()
  const parentRef = useRef<HTMLDivElement>(null)
  const { data: result } = useSuspenseQuery(realEstateQueries.listings())
  const { data: capabilities } = useSuspenseQuery(
    realEstateQueries.bulkCapabilities()
  )
  const data = useMemo(
    () =>
      result.rows.filter(
        (row) =>
          (!listingStatus || row.status === listingStatus) &&
          (!listingTypeFilter || row.listingType === listingTypeFilter)
      ),
    [listingStatus, listingTypeFilter, result.rows]
  )
  const [globalFilter, setGlobalFilter] = useState("")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const columns = useMemo(
    () =>
      getListingsColumns(setParams, locale, {
        property: t("realEstateTables.propertyTitle"),
        listingType: t("realEstateTables.listingType"),
        sale: t("realEstateTables.sale"),
        rent: t("realEstateTables.rent"),
        status: t("realEstateTables.status"),
        statuses: {
          draft: t("realEstateTables.statusDraft"),
          active: t("realEstateTables.statusActive"),
          reserved: t("realEstateTables.statusReserved"),
          sold: t("realEstateTables.statusSold"),
          rented: t("realEstateTables.statusRented"),
          expired: t("realEstateTables.statusExpired"),
          withdrawn: t("realEstateTables.statusWithdrawn"),
        },
        price: t("realEstateTables.price"),
        actions: t("realEstateTables.actions"),
        view: t("realEstateTables.view"),
        edit: t("realEstateTables.edit"),
        notAvailable: t("common.notAvailable"),
        selectAll: t("common.selectAll"),
        selectRow: t("common.selectRow"),
      }),
    [locale, setParams, t]
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
    tableId: "listings",
    initialSettings,
    columnIds,
  })
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onColumnOrderChange: setColumnOrder,
    state: {
      globalFilter,
      rowSelection,
      columnVisibility,
      columnSizing,
      columnOrder,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
  const { sensors, handleDragEnd } = useTableDnd(table)
  const { getStickyStyle, getStickyClassName } = useStickyColumns({
    columnVisibility,
    table,
    stickyColumns: STICKY_COLUMNS.listings,
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
        .filter((column) => !NON_REORDERABLE_COLUMNS.listings.has(column.id))
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
  const handleCellClick = useCallback(
    (rowId: string) => setParams({ listingId: rowId, listingMode: "details" }),
    [setParams]
  )
  const selectedCount = table.getSelectedRowModel().rows.length
  const selectedListings = table
    .getSelectedRowModel()
    .rows.map((row) => row.original)
  const virtualItems = rowVirtualizer.getVirtualItems()

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col gap-4 py-6">
      <ListingsTableHeader
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        onCreate={() => setParams({ createListing: true })}
        table={table}
        statusFilter={listingStatus}
        listingTypeFilter={listingTypeFilter}
        onStatusFilterChange={(value) => {
          setRowSelection({})
          void setParams({ listingStatus: value as typeof listingStatus })
        }}
        onListingTypeFilterChange={(value) => {
          setRowSelection({})
          void setParams({
            listingTypeFilter: value as typeof listingTypeFilter,
          })
        }}
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
                  id="listings-table-dnd"
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
                        NON_REORDERABLE_COLUMNS.listings.has(columnId)
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
                title={
                  globalFilter || listingStatus || listingTypeFilter
                    ? t("realEstateTables.noListings")
                    : t("realEstateTables.emptyListings")
                }
                description={
                  globalFilter || listingStatus || listingTypeFilter
                    ? t("common.noResults")
                    : t("common.emptyDescription")
                }
                actionLabel={
                  globalFilter || listingStatus || listingTypeFilter
                    ? t("realEstateTables.clearFilters")
                    : t("realEstateTables.addListing")
                }
                onAction={() => {
                  if (globalFilter || listingStatus || listingTypeFilter) {
                    setGlobalFilter("")
                    void setParams({
                      listingStatus: null,
                      listingTypeFilter: null,
                    })
                  } else {
                    void setParams({ createListing: true })
                  }
                }}
              />
            ) : (
              virtualItems.map((virtualRow: VirtualItem) => {
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
                    onCellClick={handleCellClick}
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
      <p className="shrink-0 text-xs text-muted-foreground">
        {t("realEstateTables.recordCount", {
          count: table.getFilteredRowModel().rows.length,
        })}
      </p>
      <AnimatePresence>
        {selectedCount > 0 && (
          <BulkActions
            selectedCount={selectedCount}
            selectedLabel={t("common.selectedRows")}
            deselectLabel={t("common.deselectAll")}
            onDeselect={() => table.toggleAllRowsSelected(false)}
            onComplete={(result) =>
              setRowSelection(
                Object.fromEntries(
                  (result.failedIds ?? []).map((id) => [id, true])
                )
              )
            }
            actionLabel={t("realEstateTables.bulkActions")}
            deleteLabel={
              capabilities.listings.delete
                ? t("realEstateTables.deleteSelected")
                : ""
            }
            deleteTitle={t("realEstateTables.deleteTitle")}
            deleteDescription={t("realEstateTables.deleteDescription", {
              count: selectedCount,
            })}
            deletePrompt={t("realEstateTables.deletePrompt", {
              keyword: "{keyword}",
            })}
            confirmationKeyword={t("realEstateTables.deleteKeyword")}
            confirmLabel={t("realEstateTables.confirmDelete")}
            cancelLabel={t("common.cancel")}
            successLabel={(actionId, count) =>
              actionId === "delete"
                ? t("realEstateTables.deletedListings")
                : t("realEstateTables.bulkSuccess", { count })
            }
            partialLabel={t("realEstateTables.bulkPartial")}
            partialDescription={t("realEstateTables.bulkPartialDescription", {
              affected: "{affected}",
              skipped: "{skipped}",
            })}
            cleanupFailedDescription={t(
              "realEstateTables.cleanupFailedDescription",
              { count: "{count}" }
            )}
            actionErrorLabel={t("realEstateTables.bulkError")}
            actions={getListingBulkActions(selectedListings, capabilities, t)}
            onAction={async (actionId) => {
              const ids = table
                .getSelectedRowModel()
                .rows.map((row) => row.original.id)
              const result =
                actionId === "delete"
                  ? await bulkDeleteListingsAction(ids)
                  : await bulkUpdateListingStatusAction({
                      ids,
                      status: actionId.replace("status:", ""),
                    })
              await Promise.all([
                queryClient.invalidateQueries({
                  queryKey: ["real-estate", "listings"],
                }),
                queryClient.invalidateQueries({
                  queryKey: ["dashboard-summary"],
                }),
              ])
              return {
                ...result,
                details:
                  "skippedReasons" in result &&
                  Array.isArray(result.skippedReasons) &&
                  result.skippedReasons.includes("not_found")
                    ? t("realEstateTables.bulkNotFound")
                    : undefined,
              }
            }}
          >
            <Button
              size="sm"
              onClick={() =>
                exportTableSelection(table, "selected-listings.csv")
              }
            >
              <Download aria-hidden="true" />
              {t("common.exportSelected")}
            </Button>
          </BulkActions>
        )}
      </AnimatePresence>
    </section>
  )
}

export { ListingsSkeleton } from "./skeleton"
export { ListingsTableHeader } from "./table-header"
