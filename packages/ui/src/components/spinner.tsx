import { cn } from "cn"
import { Loader2Icon } from "lucide-react"

function Spinner({
  className,
  label,
  ...props
}: React.ComponentProps<"svg"> & { label?: string }) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role={label ? "status" : undefined}
      aria-label={label}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
