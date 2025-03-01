"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import LanguageSwitcher from "../lang-switcher";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import logo from "@/app/icon.png";
import { useTranslations } from "next-intl";

// Add the Footer to the bottom of your landing page and more.
// The support link is connected to the config.js file. If there's no config.resend.supportEmail, the link won't be displayed.

const Footer = () => {
  const t = useTranslations("landing.footer");
  const tShared = useTranslations("shared");
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  // Check if the footer is in the viewport
  const handleScroll = () => {
    if (footerRef.current) {
      const rect = footerRef.current.getBoundingClientRect();
      if (rect.top <= window.innerHeight && rect.bottom >= 0) {
        setIsVisible(true);
        window.removeEventListener("scroll", handleScroll); // Remove listener after visibility is detected
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Define the sections to be displayed in the footer - only services and resources
  const sections = ["services", "resources"];

  return (
    <footer
      id="footer"
      ref={footerRef}
      className={`relative mx-auto px-4 py-16 max-w-7xl container transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex flex-col items-start gap-12">
        <div className="flex md:flex-row flex-col md:justify-between items-start gap-8 md:gap-16 lg:gap-32 w-full">
          {/* Row 1: Logo and Description */}
          <div className="flex flex-col items-start gap-4 w-full md:max-w-xs">
            <Link href="/#" aria-current="page" className="flex items-center gap-2">
              <Image
                src={logo}
                alt={`${tShared("appName")} logo`}
                priority={true}
                className="w-6 h-6"
                width={24}
                height={24}
              />
              <strong className="font-bold text-gray-800 dark:text-gray-200 text-lg leading-7">
                {tShared("appName")}
              </strong>
            </Link>
            <p className="font-normal text-gray-600 dark:text-gray-400 text-sm leading-5">
              {t("description")}
            </p>
          </div>

          {/* Row 2: Services and Resources Columns */}
          <div className="justify-end gap-8 grid grid-cols-2 w-full md:max-w-md">
            {sections.map((section) => (
              <div key={section} className="flex flex-col gap-4 w-full">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-base leading-6">
                  {t(`${section}.title`)}
                </h3>
                <div className="flex flex-col gap-2">
                  {Object.values(t.raw(`${section}.links.0`)).map((link: any) => (
                    <Link
                      key={link.name}
                      href={link.link}
                      className="font-normal text-gray-600 hover:text-gray-800 dark:hover:text-gray-200 dark:text-gray-400 text-sm leading-5 link link-hover"
                      aria-label={link.name}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-700 border-t w-full" />

        {/* Row 3: Copyright */}
        <div className="flex flex-row flex-wrap justify-between items-center gap-4 w-full">
          <span className="text-gray-600 dark:text-gray-400 text-sm leading-5">
            {t("copyright")}
          </span>

          <div className="flex flex-row gap-2 md:gap-4">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
