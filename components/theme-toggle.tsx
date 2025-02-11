"use client"

import * as React from "react"

import { Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex gap-1 p-1 border border-gray-300 dark:border-gray-700 rounded-lg">
      <Button
        variant={theme === "system" ? "secondary" : "ghost"}
        size="icon"
        className="w-8 h-8"
        onClick={() => setTheme("system")}
      >
        <Monitor className="w-[1rem] h-[1rem] text-gray-800 dark:text-gray-200" />
      </Button>
      <Button
        variant={theme === "light" ? "secondary" : "ghost"}
        size="icon"
        className="w-8 h-8"
        onClick={() => setTheme("light")}
      >
        <Sun className="w-[1rem] h-[1rem] text-gray-800 dark:text-gray-200" />
      </Button>
      <Button
        variant={theme === "dark" ? "secondary" : "ghost"}
        size="icon"
        className="w-8 h-8"
        onClick={() => setTheme("dark")}
      >
        <Moon className="w-[1rem] h-[1rem] text-gray-800 dark:text-gray-200" />
      </Button>
    </div>
  )
}
