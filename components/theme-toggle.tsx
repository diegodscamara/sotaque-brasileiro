"use client"

import * as React from "react"

import { Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex gap-1 p-1 border border-gray-300 dark:border-gray-700 rounded-lg" aria-label="Theme Toggle" aria-busy={false} aria-live="polite" aria-atomic={true}>
      <Button
        variant={theme === "system" ? "secondary" : "ghost"}
        size="icon"
        className="w-8 h-8"
        onClick={() => setTheme("system")}
        aria-label="System Theme"
        aria-haspopup="true"
        aria-expanded={theme === "system"}
        aria-selected={theme === "system"}
        aria-disabled={theme === "system"}
      >
        <Monitor className="w-[1rem] h-[1rem] text-gray-800 dark:text-gray-200" />
      </Button>
      <Button
        variant={theme === "light" ? "secondary" : "ghost"}
        size="icon"
        className="w-8 h-8"
        onClick={() => setTheme("light")}
        aria-label="Light Theme"
        aria-haspopup="true"
        aria-expanded={theme === "light"}
        aria-selected={theme === "light"}
        aria-disabled={theme === "light"}
      >
        <Sun className="w-[1rem] h-[1rem] text-gray-800 dark:text-gray-200" />
      </Button>
      <Button
        variant={theme === "dark" ? "secondary" : "ghost"}
        size="icon"
        className="w-8 h-8"
        onClick={() => setTheme("dark")}
        aria-label="Dark Theme"
        aria-haspopup="true"
        aria-expanded={theme === "dark"}
        aria-selected={theme === "dark"}
        aria-disabled={theme === "dark"}
      >
        <Moon className="w-[1rem] h-[1rem] text-gray-800 dark:text-gray-200" />
      </Button>
    </div>
  )
}
