"use client";

import { AnimatePresence, motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";

import LanguageSwitcher from "@/components/lang-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/libs/utils";

const Header = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  // Update header background based on scroll
  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 10);
    });
    return () => unsubscribe();
  }, [scrollY]);


  return (
    <AnimatePresence>
      <motion.header
        className={cn(
          "fixed top-0 w-full z-50 border-b transition-colors duration-200",
          isScrolled
            ? "bg-gray-50/60 dark:bg-gray-800/60 backdrop-blur-lg border-border"
            : "bg-transparent border-transparent"
        )}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <nav className="flex justify-end items-center gap-4 mx-auto px-4 w-full max-w-7xl h-14 container">
          <LanguageSwitcher />
          <ThemeToggle />
        </nav>
      </motion.header>
    </AnimatePresence>
  );
};

export default Header;
