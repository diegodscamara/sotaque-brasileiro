import { ReactNode, Suspense } from "react";
import Header from "@/components/auth/Header";
import { getSEOTags } from "@/libs/seo";
import { getTranslations } from 'next-intl/server';
import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/app/actions/users";
import { getStudent } from "@/app/actions/students";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const awaitedParams = await params;
  const { locale } = awaitedParams;

  const t = await getTranslations({ locale, namespace: 'student.seo' });
  const tShared = await getTranslations({ locale, namespace: 'shared' });

  return getSEOTags({
    title: `${tShared('appName')} - ${t('title')}`,
    canonicalUrlRelative: "/student/onboarding",
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
      canonical: `/${locale}/student/onboarding`,
      languages: {
        'en': '/en/student/onboarding',
        'es': '/es/student/onboarding',
        'fr': '/fr/student/onboarding',
        'pt': '/pt/student/onboarding',
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

/**
 * Layout component for student onboarding
 * Ensures only students who need to complete onboarding can access this page
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render
 * @returns {ReactNode} The protected layout with children
 */
export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/signin");
  }

  // Get user data using server action
  const dbUser = await getCurrentUser();

  // If user not found in database, redirect to login
  if (!dbUser) {
    redirect("/signin");
  }

  // If user is not a student, redirect to dashboard
  if (dbUser.role !== Role.STUDENT) {
    redirect("/dashboard");
  }

  // Get student data using server action
  const student = await getStudent(user.id);

  // If student data not found, redirect to login
  if (!student) {
    redirect("/signin");
  }

  // If student has completed onboarding and has access, redirect to dashboard
  if (student.hasCompletedOnboarding && student.hasAccess) {
    redirect("/dashboard");
  }

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
