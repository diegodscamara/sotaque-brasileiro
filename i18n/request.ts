import {getRequestConfig} from 'next-intl/server';
import { headers } from 'next/headers';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale, // Required in next-intl 3.22+
    messages: (await import(`../messages/${locale}.json`)).default
  };
});

export async function getLocaleFromHeaders() {
  const headersList = await headers();
  return headersList.get('X-NEXT-INTL-LOCALE');
}