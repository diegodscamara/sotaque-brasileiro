"use client"

import * as React from "react"

import { Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const t = useTranslations("shared")

  return (
    <div className="flex gap-1 p-1 border border-gray-300 dark:border-gray-700 rounded-lg" aria-label="Theme Toggle" aria-busy={false} aria-live="polite" aria-atomic={true}>
      <Button
        variant={"ghost"}
        size="icon"
        className={`${theme === "system" ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-default" : "hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"} w-8 h-8`}
        onClick={theme !== "system" ? () => setTheme("system") : undefined}
        aria-label="System Theme"
        aria-haspopup="true"
        aria-expanded={theme === "system"}
        aria-selected={theme === "system"}
        aria-disabled={theme === "system"}
        title={t("themeToggle.system")}
      >
        <Monitor className="w-[1rem] h-[1rem] text-gray-800 dark:text-gray-200" />
      </Button>
      <Button
        variant={"ghost"}
        size="icon"
        className={`${theme === "light" ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-default" : "hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"} w-8 h-8`}
        onClick={theme !== "light" ? () => setTheme("light") : undefined}
        aria-label="Light Theme"
        aria-haspopup="true"
        aria-expanded={theme === "light"}
        aria-selected={theme === "light"}
        aria-disabled={theme === "light"}
        title={t("themeToggle.light")}
      >
        <Sun className="w-[1rem] h-[1rem] text-gray-800 dark:text-gray-200" />
      </Button>
      <Button
        variant={"ghost"}
        size="icon"
        className={`${theme === "dark" ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-default" : "hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"} w-8 h-8`}
        onClick={theme !== "dark" ? () => setTheme("dark") : undefined}
        aria-label="Dark Theme"
        aria-haspopup="true"
        aria-expanded={theme === "dark"}
        aria-selected={theme === "dark"}
        aria-disabled={theme === "dark"}
        title={t("themeToggle.dark")}
      >
        <Moon className="w-[1rem] h-[1rem] text-gray-800 dark:text-gray-200" />
      </Button>
    </div>
  )
}
