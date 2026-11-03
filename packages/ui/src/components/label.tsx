"use client"

import { cn } from "cn"
import type * as React from "react"

function Label({
  className,
  htmlFor,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <>
      {/* biome-ignore lint/a11y/noLabelWithoutControl: htmlFor is forwarded by this wrapper to the caller's input. */}
      <label
        data-slot="label"
        htmlFor={htmlFor}
        className={cn(
          "flex items-center gap-2 text-sm font-medium leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
        {...props}
      />
    </>
  )
}

export { Label }
