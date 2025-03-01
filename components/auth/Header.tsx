"use client";

import { AnimatePresence, motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";

import LanguageSwitcher from "@/components/lang-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/libs/utils";
import config from "@/config";
import logo from "@/app/icon.png";
import Image from "next/image";
import Link from "next/link";

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
        <nav className="flex justify-between items-center mx-auto px-4 max-w-7xl h-14 container">
          {/* Logo */}
          <Link
            className="flex items-center gap-2 shrink-0"
            href="/"
            title={`${config.appName} homepage`}
          >
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-8"
              placeholder="blur"
              priority={true}
              width={32}
              height={32}
            />
            <span className="font-extrabold text-lg">{config.appName}</span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </nav>
      </motion.header>
    </AnimatePresence>
  );
};

export default Header;
