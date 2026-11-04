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
  bulkArchivePropertiesAction,
  bulkDeletePropertiesAction,
} from "@/actions/real-estate"
import {
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
import { getPropertiesColumns } from "./columns"
import { PropertiesTableHeader } from "./table-header"

const NON_CLICKABLE_COLUMNS = new Set(["select", "actions"])

export function PropertiesTable({
  initialSettings,
}: {
  initialSettings?: Partial<TableSettings>
}) {
  const { setParams, propertyTypeFilter } = useRealEstateParams()
  const locale = useCurrentLocale()
  const t = useI18n()
  const queryClient = useQueryClient()
  const parentRef = useRef<HTMLDivElement>(null)
  const { data: properties } = useSuspenseQuery(realEstateQueries.properties())
  const { data: capabilities } = useSuspenseQuery(
    realEstateQueries.bulkCapabilities()
  )
  const data = useMemo(
    () =>
      propertyTypeFilter
        ? properties.filter((property) => property.type === propertyTypeFilter)
        : properties,
    [properties, propertyTypeFilter]
  )
  const [globalFilter, setGlobalFilter] = useState("")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const columns = useMemo(
    () =>
      getPropertiesColumns(setParams, locale, {
        property: t("realEstateTables.propertyTitle"),
        city: t("realEstateTables.city"),
        district: t("realEstateTables.district"),
        area: t("realEstateTables.area"),
        actions: t("realEstateTables.actions"),
        view: t("realEstateTables.view"),
        edit: t("realEstateTables.edit"),
        notAvailable: t("common.notAvailable"),
        squareMeters: t("realEstateTables.squareMeters"),
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
    tableId: "properties",
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
    stickyColumns: STICKY_COLUMNS.properties,
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
        .filter((column) => !NON_REORDERABLE_COLUMNS.properties.has(column.id))
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
    (rowId: string) =>
      setParams({ propertyId: rowId, propertyMode: "details" }),
    [setParams]
  )
  const selectedCount = table.getSelectedRowModel().rows.length
  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id)
  const virtualItems = rowVirtualizer.getVirtualItems()

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col gap-4 py-6">
      <PropertiesTableHeader
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        onCreate={() => setParams({ createProperty: true })}
        table={table}
        propertyTypeFilter={propertyTypeFilter}
        onPropertyTypeFilterChange={(value) => {
          setRowSelection({})
          void setParams({
            propertyTypeFilter: value as typeof propertyTypeFilter,
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
                  id="properties-table-dnd"
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
                        NON_REORDERABLE_COLUMNS.properties.has(columnId)
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
                  globalFilter || propertyTypeFilter
                    ? t("realEstateTables.noProperties")
                    : t("realEstateTables.emptyProperties")
                }
                description={
                  globalFilter || propertyTypeFilter
                    ? t("common.noResults")
                    : t("common.emptyDescription")
                }
                actionLabel={
                  globalFilter || propertyTypeFilter
                    ? t("realEstateTables.clearFilters")
                    : t("realEstateTables.addProperty")
                }
                onAction={() => {
                  if (globalFilter || propertyTypeFilter) {
                    setGlobalFilter("")
                    void setParams({ propertyTypeFilter: null })
                  } else {
                    void setParams({ createProperty: true })
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
              capabilities.properties.delete
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
            successLabel={(actionId, count) => {
              if (actionId === "delete") {
                return t("realEstateTables.deletedProperties")
              }
              if (actionId === "archive") {
                return t("realEstateTables.archivedProperties")
              }
              return t("realEstateTables.bulkSuccess", { count })
            }}
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
            actions={
              capabilities.properties.archive
                ? [
                    {
                      id: "archive",
                      label: t("realEstateTables.archiveSelected"),
                    },
                  ]
                : []
            }
            onAction={async (actionId) => {
              const result =
                actionId === "delete"
                  ? await bulkDeletePropertiesAction(selectedIds)
                  : await bulkArchivePropertiesAction(selectedIds)
              await Promise.all([
                queryClient.invalidateQueries({
                  queryKey: ["real-estate", "properties"],
                }),
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
                  Array.isArray(result.skippedReasons)
                    ? [
                        result.skippedReasons.includes("has_listings")
                          ? t("realEstateTables.listingBlockedByProperty")
                          : undefined,
                        result.skippedReasons.includes("not_found")
                          ? t("realEstateTables.bulkNotFound")
                          : undefined,
                      ]
                        .filter(Boolean)
                        .join(" ")
                    : undefined,
              }
            }}
          >
            <Button
              size="sm"
              onClick={() =>
                exportTableSelection(table, "selected-properties.csv")
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

export { PropertiesSkeleton } from "./skeleton"
export { PropertiesTableHeader } from "./table-header"
