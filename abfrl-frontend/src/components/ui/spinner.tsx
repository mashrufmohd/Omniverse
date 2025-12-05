import * as React from "react"
import { cn } from "@/lib/utils"

const Spinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-4 w-4",
      className
    )}
    {...props}
  />
))
Spinner.displayName = "Spinner"

export { Spinner }