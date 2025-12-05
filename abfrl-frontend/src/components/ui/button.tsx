import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap text-sm font-bold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-border active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"

    const variantClasses = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-retro hover:shadow-retro-hover hover:translate-x-[2px] hover:translate-y-[2px]",
      outline: "bg-background text-foreground hover:bg-accent hover:text-accent-foreground shadow-retro hover:shadow-retro-hover hover:translate-x-[2px] hover:translate-y-[2px]",
      ghost: "hover:bg-accent hover:text-accent-foreground border-transparent hover:border-border"
    }

    const sizeClasses = {
      default: "h-12 px-6 py-2",
      sm: "h-10 px-4 text-xs",
      lg: "h-14 px-10 text-base"
    }

    return (
      <button
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }