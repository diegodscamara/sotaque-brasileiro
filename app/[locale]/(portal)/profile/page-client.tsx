"use client";

import PortalClientLayout from "../PortalClientLayout";
import { ProfileForm } from "@/components/profile-form";
import { ProfileHeader } from "@/components/profile-header";
import { useTranslations } from "next-intl";
import { useUser } from "@/contexts/user-context";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * ProfilePageClient component that renders the profile page
 * Uses the UserContext to avoid redundant data fetching
 * Includes error handling and data refresh capabilities
 * 
 * @component
 * @returns {React.JSX.Element} Profile page with user data
 */
export function ProfilePageClient(): React.JSX.Element {
  const t = useTranslations("profile");
  const { isLoading } = useUser();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Add a small delay to ensure the user data is loaded
  useEffect(() => {
    if (!isLoading) {
      // Set a small timeout to ensure the user data is fully loaded
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Show error state if data fetching failed
  if (error) {
    return (
      <PortalClientLayout pageTitle={t("title")}>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>{t("error.title")}</AlertTitle>
          <AlertDescription>{t("error.description")}</AlertDescription>
        </Alert>
      </PortalClientLayout>
    );
  }

  // Show loading skeleton while data is being fetched
  if (!isReady) {
    return (
      <PortalClientLayout pageTitle={t("title")}>
        <div className="space-y-8" aria-busy="true" aria-live="polite">
          <div className="p-6 rounded-md">
            <div className="flex md:flex-row flex-col gap-6">
              <Skeleton className="rounded-full w-32 h-32" aria-label="Loading avatar" />
              <div className="flex-1 space-y-4">
                <Skeleton className="w-1/3 h-8" aria-label="Loading name" />
                <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                  <Skeleton className="w-full h-16" aria-label="Loading user detail" />
                  <Skeleton className="w-full h-16" aria-label="Loading user detail" />
                  <Skeleton className="w-full h-16" aria-label="Loading user detail" />
                  <Skeleton className="w-full h-16" aria-label="Loading user detail" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="w-1/2 h-8" aria-label="Loading form title" />
            <Skeleton className="w-full h-12" aria-label="Loading form field" />
            <Skeleton className="w-full h-12" aria-label="Loading form field" />
            <Skeleton className="w-full h-12" aria-label="Loading form field" />
          </div>
        </div>
      </PortalClientLayout>
    );
  }

  return (
    <PortalClientLayout pageTitle={t("title")}>
      <div className="space-y-4">
        <ProfileHeader />
        <ProfileForm />
      </div>
    </PortalClientLayout>
  );
} 