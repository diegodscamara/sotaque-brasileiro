import * as React from "react"

import { cn } from "@/libs/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-200 bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 active:border-primary-600 file:bg-transparent file:text-sm file:font-medium file:text-gray-900 dark:file:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
