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
    <div 
      className="flex gap-1 p-1 border border-gray-300 dark:border-gray-700 rounded-lg" 
      role="radiogroup" 
      aria-label="Theme Toggle"
    >
      <Button
        variant={"ghost"}
        size="icon"
        className={`${theme === "system" ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-default" : "hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"} w-8 h-8`}
        onClick={theme !== "system" ? () => setTheme("system") : undefined}
        role="radio"
        aria-checked={theme === "system"}
        aria-label="System Theme"
        title={t("themeToggle.system")}
      >
        <Monitor className="w-[1rem] h-[1rem] text-gray-800 dark:text-gray-200" />
      </Button>
      <Button
        variant={"ghost"}
        size="icon"
        className={`${theme === "light" ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-default" : "hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"} w-8 h-8`}
        onClick={theme !== "light" ? () => setTheme("light") : undefined}
        role="radio"
        aria-checked={theme === "light"}
        aria-label="Light Theme"
        title={t("themeToggle.light")}
      >
        <Sun className="w-[1rem] h-[1rem] text-gray-800 dark:text-gray-200" />
      </Button>
      <Button
        variant={"ghost"}
        size="icon"
        className={`${theme === "dark" ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-default" : "hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"} w-8 h-8`}
        onClick={theme !== "dark" ? () => setTheme("dark") : undefined}
        role="radio"
        aria-checked={theme === "dark"}
        aria-label="Dark Theme"
        title={t("themeToggle.dark")}
      >
        <Moon className="w-[1rem] h-[1rem] text-gray-800 dark:text-gray-200" />
      </Button>
    </div>
  )
}
