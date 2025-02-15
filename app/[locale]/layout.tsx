import "../globals.css";

import { Analytics } from "@vercel/analytics/react"
import ClientLayout from "@/components/LayoutClient";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next"
import SupabaseProvider from "../providers/SupabaseProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster"
import { Viewport } from "next";
import { getSEOTags } from "@/libs/seo";
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
};

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
	const t = await getTranslations({ locale, namespace: 'landing' });
	const tShared = await getTranslations({ locale, namespace: 'shared' });

	return getSEOTags({
		title: tShared('appName'),
		description: t('seo.seoDescription'),
		openGraph: {
			title: tShared('appName'),
			description: t('seo.seoDescription'),
			images: [
				{
					url: "/images/og-image.png",
					width: 1200,
					height: 630,
					alt: t('hero.imageAlt')
				},
			],
			locale,
			type: "website",
			siteName: tShared('appName'),
		},
		twitter: {
			card: "summary_large_image",
			title: tShared('appName'),
			description: t('seo.seoDescription'),
			images: [
				{
					url: "/images/og-image.png",
					width: 1200,
					height: 630,
					alt: t('hero.imageAlt')
				},
			],
			creator: "@sotaquebrasileiro",
			site: "@sotaquebrasileiro",
		},
		alternates: {
			canonical: "/",
			languages: {
				'en': '/en',
				'es': '/es',
				'fr': '/fr',
				'pt': '/pt',
			},
		},
		robots: {
			index: true,
			follow: true,
			noimageindex: false,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
		keywords: t('seo.keywords'),
	});
}

type LayoutProps = {
	children: ReactNode;
	params: { locale: string };
};

/**
 * Loads locale-specific messages
 * @param locale - The locale to load messages for
 * @returns The messages object for the specified locale
 */
async function loadMessages(locale: string) {
	try {
		return (await import(`@/messages/${locale}.json`)).default;
	} catch (error) {
		notFound();
	}
}

/**
 * Validates if a locale is supported
 * @param locale - The locale to validate
 * @returns True if locale is supported, false otherwise
 */
function isValidLocale(locale: string): locale is Locale {
	return routing.locales.includes(locale as Locale);
}

export default async function LocaleLayout({
	children,
	params,
}: LayoutProps) {
	// Use React.use() to unwrap the params promise
	const resolvedParams = await Promise.resolve(params);
	const locale = resolvedParams.locale;

	// Validate locale
	if (!isValidLocale(locale)) {
		notFound();
	}

	// Load messages after locale validation
	const messages = await loadMessages(locale);

	return (
		<html
			lang={locale}
			className={inter.className}
			suppressHydrationWarning
		>
			<head />
			<body
				suppressHydrationWarning
				className="bg-gray-50 dark:bg-gray-800 min-h-screen"
			>
				<NextIntlClientProvider locale={locale} messages={messages}>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
						<SupabaseProvider>
							{/* <ScrollProgress className="top-[65px]" /> */}
							<ClientLayout>{children}</ClientLayout>
							<Analytics />
							<SpeedInsights />
							<Toaster />
						</SupabaseProvider>
					</ThemeProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
