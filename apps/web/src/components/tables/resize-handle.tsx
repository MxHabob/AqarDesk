"use client"

import { cn } from "@aqardesk/ui/cn"
import type { Header } from "@tanstack/react-table"

interface ResizeHandleProps<TData> {
  header: Header<TData, unknown>
  className?: string
}

export function ResizeHandle<TData>({
  header,
  className,
}: ResizeHandleProps<TData>) {
  if (!header.column.getCanResize()) {
    return null
  }

  const table = header.getContext().table
  const minSize =
    header.column.columnDef.minSize ??
    table.options.defaultColumn?.minSize ??
    20
  const maxSize =
    header.column.columnDef.maxSize ??
    table.options.defaultColumn?.maxSize ??
    1500

  return (
    <hr
      aria-label="Resize column"
      aria-orientation="vertical"
      aria-valuenow={header.getSize()}
      aria-valuemin={minSize}
      aria-valuemax={maxSize}
      tabIndex={0}
      onDoubleClick={() => header.column.resetSize()}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault()
          table.setColumnSizing((currentSizing) => ({
            ...currentSizing,
            [header.column.id]: Math.min(
              maxSize,
              Math.max(
                minSize,
                header.getSize() + (event.key === "ArrowRight" ? 10 : -10)
              )
            ),
          }))
        }
      }}
      onMouseDown={(e) => {
        e.stopPropagation() // Prevent drag from triggering
        header.getResizeHandler()(e)
      }}
      onTouchStart={(e) => {
        e.stopPropagation() // Prevent drag from triggering
        header.getResizeHandler()(e)
      }}
      onPointerDown={(e) => e.stopPropagation()} // Stop dnd-kit from capturing
      className={cn(
        "absolute end-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
        "m-0 border-0 bg-transparent p-0",
        className
      )}
      data-table-resize-handle
      style={{
        transform: "translateX(50%)",
      }}
    />
  )
}
