'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { GlobeSimple } from '@phosphor-icons/react';
import { JSX } from 'react';
import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

/**
 * Language switcher component that allows users to change the application language
 * @returns {JSX.Element} The language switcher component
 */
export default function LanguageSwitcher(): JSX.Element {
  const t = useTranslations('shared.langSwitcher');
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';

  const SUPPORTED_LANGUAGES: Language[] = [
    { code: 'en', name: t('english'), nativeName: 'English' },
    { code: 'fr', name: t('french'), nativeName: 'Français' },
    { code: 'pt', name: t('portuguese'), nativeName: 'Português' },
    { code: 'es', name: t('spanish'), nativeName: 'Español' },
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
      <DropdownMenuTrigger aria-label="Select language" className="inline-flex justify-center items-center gap-2 hover:bg-accent dark:hover:bg-gray-700/50 disabled:opacity-50 p-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 h-10 [&_svg]:size-4 font-medium [&_svg]:text-gray-800 dark:[&_svg]:text-gray-200 text-sm whitespace-nowrap transition-colors hover:text-accent-foreground disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0"
      >
        <GlobeSimple className="w-4 h-4" />
        <span className="text-sm">{currentLanguage?.name}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-700">
        {SUPPORTED_LANGUAGES.map(({ code, name, nativeName }) => (
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
              <span className="text-sm">{nativeName}</span>
              <span className="text-muted-foreground text-xs">({name})</span>
            </DropdownMenuItem>
          </motion.div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}