'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCallback, useState } from 'react';

import { Button } from './ui/button';
import { CaretDown } from '@phosphor-icons/react';
import { JSX } from 'react';
import { usePathname } from 'next/navigation';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
];

/**
 * Language switcher component that allows users to change the application language
 * @returns {JSX.Element} The language switcher component
 */
export default function LanguageSwitcher(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';
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
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger aria-label="Select language"
      >
        <Button variant="outline">
          <span className="mt-1 text-sm">{currentLanguage?.flag}</span>
          <CaretDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
              }`}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map(({ code, name, nativeName, flag }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={`flex items-center gap-2 cursor-pointer
              ${currentLocale === code ? 'bg-muted' : ''}`}
          >
            <span className="text-base" aria-hidden="true">{flag}</span>
            <span className="text-sm">{nativeName}</span>
            <span className="text-muted-foreground text-xs">({name})</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}