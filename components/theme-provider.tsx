"use client"

import * as React from "react"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useMounted } from "@/libs/useMounted"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const mounted = useMounted()

  return mounted && <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
