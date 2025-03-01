'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// @ts-ignore
import { CircleFlag } from 'react-circle-flags';
import { JSX } from 'react';
import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface Language {
  code: string;
  nativeName: string;
  countryCode: string; // ISO country code for the flag
}

/**
 * Language switcher component that allows users to change the application language
 * @returns {JSX.Element} The language switcher component
 */
export default function LanguageSwitcher(): JSX.Element {
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';

  const SUPPORTED_LANGUAGES: Language[] = [
    { code: 'en', nativeName: 'English', countryCode: 'us' },
    { code: 'fr', nativeName: 'Français', countryCode: 'fr' },
    { code: 'pt', nativeName: 'Português', countryCode: 'br' },
    { code: 'es', nativeName: 'Español', countryCode: 'es' },
  ];

  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLocale);

  /**
   * Handles language change by redirecting to the new locale path
   * @param {string} newLocale - The locale code to switch to
   */
  const handleLanguageChange = useCallback((newLocale: string) => {
    // Remove the current locale from the pathname if it exists
    const newPathname = pathname.replace(`/${currentLocale}`, '') || '/';
    // Construct the new path with the selected locale
    const newPath = `/${newLocale}${newPathname}`;
    // Use window.location for client-side navigation to trigger full page reload
    window.location.href = newPath;
  }, [pathname, currentLocale]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Select language, current language: ${currentLanguage?.nativeName}`}
        className="inline-flex justify-center items-center gap-2 hover:bg-accent dark:hover:bg-gray-700/50 disabled:opacity-50 p-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 h-10 font-medium text-sm whitespace-nowrap transition-colors hover:text-accent-foreground disabled:pointer-events-none"
      >
        {currentLanguage && (
          <CircleFlag
            countryCode={currentLanguage.countryCode}
            height={20}
            width={20}
            className="rounded-full"
            aria-hidden="true"
            alt={currentLanguage.nativeName}
          />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-700">
        {SUPPORTED_LANGUAGES.map(({ code, nativeName, countryCode }) => (
          <motion.div
            key={code}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <DropdownMenuItem
              onClick={() => handleLanguageChange(code)}
              className={`flex items-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600
                ${currentLocale === code ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            >
              <CircleFlag
                countryCode={countryCode}
                height={16}
                width={16}
                className="rounded-full"
                aria-hidden="true"
                alt={nativeName}
              />
              <span className="text-sm">{nativeName}</span>
            </DropdownMenuItem>
          </motion.div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}