import { Pathnames } from 'next-intl/navigation';
import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'fr', 'pt'] as const;
export type Locale = typeof locales[number];

export const routing = {
    locales,
    defaultLocale: 'en' as Locale,
    alternateLinks: true,
} as const;

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);