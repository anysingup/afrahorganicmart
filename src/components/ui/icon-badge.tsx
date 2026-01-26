import * as React from "react"
import { cn } from "@/lib/utils"

export interface IconBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
}

const IconBadge = React.forwardRef<HTMLDivElement, IconBadgeProps>(
  ({ className, count, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        {...props}
      >
        {children}
        {count !== undefined && count > 0 && (
          <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </div>
    )
  }
)
IconBadge.displayName = "IconBadge"

export { IconBadge }
