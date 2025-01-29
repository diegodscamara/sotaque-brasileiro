'use client';

import { JSX, useCallback } from 'react';

import { Globe } from '@phosphor-icons/react';
import React from 'react';
import { usePathname } from 'next/navigation';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
];

/**
 * Language switcher component that allows users to change the application language
 * @returns {JSX.Element} The language switcher component
 */
export default function LanguageSwitcher(): JSX.Element {
  const pathname = usePathname();
  
  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1] || 'en';

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
    <nav
      aria-label="Language switcher"
      className="relative flex items-center gap-2"
    >
      <Globe 
        className="w-4 h-4" 
        aria-hidden="true"
      />
      <ul className="flex items-center gap-2">
        {SUPPORTED_LANGUAGES.map(({ code, name, nativeName }) => (
          <li key={code}>
            <button
              onClick={() => handleLanguageChange(code)}
              className={`px-2 py-1 rounded-md text-sm transition-colors
                ${currentLocale === code 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
                }`}
              aria-current={currentLocale === code ? 'true' : 'false'}
              lang={code}
              title={name}
            >
              {nativeName}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}