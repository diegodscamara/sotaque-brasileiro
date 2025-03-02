"use client"

import * as React from "react"
import { cn } from "@/libs/utils"

/**
 * Custom Progress component for displaying progress bars
 * 
 * @component
 * @example
 * ```tsx
 * <Progress value={33} />
 * ```
 */
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The current progress value (0-100) */
  value?: number
  /** Maximum value (default: 100) */
  max?: number
  /** Minimum value (default: 0) */
  min?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, min = 0, max = 100, ...props }, ref) => {
    // Ensure value is within bounds
    const boundedValue = Math.max(min, Math.min(max, value))
    const percentage = ((boundedValue - min) / (max - min)) * 100

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800",
          className
        )}
        role="progressbar"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={boundedValue}
        {...props}
      >
        <div
          className="flex-1 w-full h-full transition-all duration-300 ease-in-out"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: 'var(--progress-color, var(--primary, #0284c7))'
          }}
        />
      </div>
    )
  }
)

Progress.displayName = "Progress"

export { Progress } 