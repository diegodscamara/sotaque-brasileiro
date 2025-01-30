import { createNavigation } from 'next-intl/navigation';

export const locales = ['en', 'fr', 'pt', 'es'] as const;
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