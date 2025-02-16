import { ReactNode, Suspense } from "react";

import Header from "@/components/auth/Header";
import { getSEOTags } from "@/libs/seo";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const awaitedParams = await params;
  const { locale } = awaitedParams;

  const t = await getTranslations({ locale, namespace: 'auth.sign-up' });
  const tShared = await getTranslations({ locale, namespace: 'shared' });

  return getSEOTags({
    title: `${tShared('appName')} - ${t('title')}`,
    canonicalUrlRelative: "/auth/signup",
    description: t('seoDescription'),
    openGraph: {
      title: `${tShared('appName')} - ${t('title')}`,
      description: t('seoDescription'),
      images: [
        {
          url: "/images/og-image.png",
          width: 1200,
          height: 630,
          alt: t('ogImageAlt')
        },
      ],
      locale,
      type: "website",
      siteName: tShared('appName'),
    },
    twitter: {
      card: "summary_large_image",
      title: `${tShared('appName')} - ${t('title')}`,
      description: t('seoDescription'),
      images: [
        {
          url: "/images/og-image.png",
          width: 1200,
          height: 630,
          alt: t('ogImageAlt')
        },
      ],
      creator: "@sotaquebrasileiro",
      site: "@sotaquebrasileiro",
    },
    alternates: {
      canonical: "/auth/signup",
      languages: {
        'en': '/en/auth/signup',
        'es': '/es/auth/signup',
        'fr': '/fr/auth/signup',
        'pt': '/pt/auth/signup',
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
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png" }
      ],
    },
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#ffffff" },
      { media: "(prefers-color-scheme: dark)", color: "#000000" },
    ],
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 5,
    },
    manifest: "/manifest.json",
    category: "education",
    authors: [{ name: tShared('appName'), url: tShared('appUrl') }],
    creator: tShared('appName'),
    publisher: tShared('appName'),
    keywords: t('keywords'),
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>
    <Suspense>
      <Header />
    </Suspense>
    <main className="flex flex-col justify-center items-center mx-auto h-full">
      {children}
    </main>
  </>
}
