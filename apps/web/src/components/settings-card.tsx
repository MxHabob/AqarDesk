import { cn } from "@aqardesk/ui/cn"
import type * as React from "react"

function SettingsCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("border bg-background text-card-foreground", className)}
      {...props}
    />
  )
}

function SettingsCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
}

function SettingsCardTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "mb-2 text-lg font-medium leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function SettingsCardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-[#606060]", className)} {...props} />
}

function SettingsCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}

function SettingsCardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center border-t p-6 text-xs text-[#606060]",
        className
      )}
      {...props}
    />
  )
}

export {
  SettingsCard,
  SettingsCardContent,
  SettingsCardDescription,
  SettingsCardFooter,
  SettingsCardHeader,
  SettingsCardTitle,
}
