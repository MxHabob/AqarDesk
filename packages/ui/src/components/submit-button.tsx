import { cn } from "cn"
import type * as React from "react"
import { Button } from "./button"
import { Spinner } from "./spinner"

export function SubmitButton({
  children,
  isSubmitting,
  disabled,
  className,
  ...props
}: React.ComponentProps<typeof Button> & {
  isSubmitting: boolean
}) {
  return (
    <Button
      disabled={isSubmitting || disabled}
      {...props}
      className={cn("relative", className)}
    >
      <span className={cn(isSubmitting && "invisible")}>{children}</span>
      {isSubmitting && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner label="جارٍ الإرسال" />
        </span>
      )}
    </Button>
  )
}
