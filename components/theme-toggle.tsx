"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Moon, Sun } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Button } from "./ui/button"

/**
 * Theme toggle component that displays the active theme icon as a button
 * Based on system preference initially, then allows toggle with a click
 * @returns {React.JSX.Element} The theme toggle button component
 */
export function ThemeToggle(): React.JSX.Element {
  const { setTheme, resolvedTheme } = useTheme()
  const t = useTranslations("shared")
  const [mounted, setMounted] = useState(false)

  // Determine if the theme is dark based on the resolved theme
  const isLightTheme = resolvedTheme === "light"

  // Effect to handle initial mounting and system preference
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(isLightTheme ? "dark" : "light")
  }

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className="w-10 h-10" aria-hidden="true" />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-10 h-10"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={isLightTheme ? t("themeToggle.light") : t("themeToggle.dark")}
        className="relative rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-10 h-10"
      >
        <motion.div
          className="absolute inset-0 flex justify-center items-center"
          initial={false}
          animate={{
            opacity: isLightTheme ? 1 : 0,
            scale: isLightTheme ? 1 : 0.5,
            rotate: isLightTheme ? 0 : -30
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <Moon
            weight="fill"
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
            aria-hidden="true"
          />
        </motion.div>

        <motion.div
          className="absolute inset-0 flex justify-center items-center"
          initial={false}
          animate={{
            opacity: !isLightTheme ? 1 : 0,
            scale: !isLightTheme ? 1 : 0.5,
            rotate: !isLightTheme ? 0 : 30
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <Sun
            weight="fill"
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
            aria-hidden="true"
          />
        </motion.div>
      </Button>

      <span className="sr-only">
        {isLightTheme ? t("themeToggle.light") : t("themeToggle.dark")}
      </span>
    </motion.div>
  )
}
