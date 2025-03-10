import * as React from "react"

import { cn } from "@/libs/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-gray-300 dark:border-gray-500 bg-popover hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 text-base shadow-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus:outline-none focus:ring-1 focus:ring-green-700 dark:focus:ring-green-500 focus:border-green-700 dark:focus:border-green-500",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
