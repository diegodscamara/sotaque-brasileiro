"use client"

import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { JSX, useCallback } from 'react'
import { Monitor, Moon, Sun } from "@phosphor-icons/react"

import { Button } from "./ui/button"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"

/**
 * Theme toggle component that allows users to switch between themes
 * @param {string} variant - The variant of the theme toggle ("default" or "dropdown")
 * @returns {JSX.Element} The theme toggle component
 */
export function ThemeToggle({ variant = "default" }: { variant?: "default" | "dropdown" }): JSX.Element {
  const { theme, setTheme } = useTheme()
  const t = useTranslations("shared")

  const handleThemeChange = useCallback((newTheme: string) => {
    setTheme(newTheme)
  }, [setTheme])

  if (variant === "dropdown") {
    let activeIcon;
    switch (theme) {
      case "light":
        activeIcon = <Sun className="w-4 h-4" />;
        break;
      case "dark":
        activeIcon = <Moon className="w-4 h-4" />;
        break;
      default:
        activeIcon = <Monitor className="w-4 h-4" />;
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Select theme" className="inline-flex justify-center items-center gap-2 hover:bg-accent dark:hover:bg-gray-700/50 disabled:opacity-50 p-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 h-10 [&_svg]:size-4 font-medium [&_svg]:text-gray-800 dark:[&_svg]:text-gray-200 text-sm whitespace-nowrap transition-colors hover:text-accent-foreground disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0">
          {activeIcon}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="bg-white dark:bg-gray-700">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <DropdownMenuItem onClick={() => handleThemeChange("system")} className={`flex items-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 ${theme === "system" ? "bg-gray-200 dark:bg-gray-600" : ""}`}>
              <Monitor className="w-4 h-4" />
              <span className="text-sm">{t("themeToggle.system")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleThemeChange("light")} className={`flex items-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 ${theme === "light" ? "bg-gray-200 dark:bg-gray-600" : ""}`}>
              <Sun className="w-4 h-4" />
              <span className="text-sm">{t("themeToggle.light")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleThemeChange("dark")} className={`flex items-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 ${theme === "dark" ? "bg-gray-200 dark:bg-gray-600" : ""}`}>
              <Moon className="w-4 h-4" />
              <span className="text-sm">{t("themeToggle.dark")}</span>
            </DropdownMenuItem>
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div
      className="flex justify-center items-center gap-1 bg-gray-50 dark:bg-gray-800 p-1 border border-gray-300 dark:border-gray-500 rounded-lg h-10 text-gray-800 dark:text-gray-200 hover:text-accent-foreground"
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
