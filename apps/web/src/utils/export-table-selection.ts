import type { Table } from "@tanstack/react-table"

function toCsvCell(value: unknown) {
  const text =
    value instanceof Date
      ? value.toISOString()
      : typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ? String(value)
        : value == null
          ? ""
          : JSON.stringify(value)

  return `"${text.replaceAll('"', '""')}"`
}

export function exportTableSelection<TData>(
  table: Table<TData>,
  filename: string
) {
  const rows = table.getSelectedRowModel().rows
  const columns = table
    .getVisibleLeafColumns()
    .filter((column) => column.id !== "select" && column.id !== "actions")

  if (rows.length === 0 || columns.length === 0) return

  const csv = [
    columns
      .map((column) =>
        toCsvCell(
          typeof column.columnDef.header === "string"
            ? column.columnDef.header
            : column.id
        )
      )
      .join(","),
    ...rows.map((row) =>
      columns.map((column) => toCsvCell(row.getValue(column.id))).join(",")
    ),
  ].join("\r\n")
  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
