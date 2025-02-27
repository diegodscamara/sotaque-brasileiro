import { ReactNode, Suspense } from "react";

import Header from "@/components/auth/Header";
import { getSEOTags } from "@/libs/seo";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const awaitedParams = await params;
  const { locale } = awaitedParams;

  const t = await getTranslations({ locale, namespace: 'auth.forgot-password' });
  const tShared = await getTranslations({ locale, namespace: 'shared' });

  return getSEOTags({
    title: `${tShared('appName')} - ${t('title')}`,
    canonicalUrlRelative: "/auth/forgot-password",
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
      canonical: `/${locale}/forgot-password`,
      languages: {
        'en': '/en/auth/forgot-password',
        'es': '/es/auth/forgot-password',
        'fr': '/fr/auth/forgot-password',
        'pt': '/pt/auth/forgot-password',
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
    keywords: t('keywords'),
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main className="flex flex-col justify-center items-center mx-auto h-full">
        {children}
      </main>
    </>
  );
}
