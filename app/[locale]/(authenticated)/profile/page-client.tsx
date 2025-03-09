"use client";

import AuthenticatedClientLayout from "../AuthenticatedClientLayout";
import { ProfileForm } from "@/components/profile-form";
import { ProfileHeader } from "@/components/profile-header";
import { useTranslations } from "next-intl";
import { useUser } from "@/contexts/user-context";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * ProfilePageClient component that renders the profile page
 * Uses the UserContext to avoid redundant data fetching
 * @component
 * @returns {React.JSX.Element} Profile page with user data
 */
export function ProfilePageClient(): React.JSX.Element {
  const t = useTranslations("profile");
  const { isLoading } = useUser();
  const [isReady, setIsReady] = useState(false);

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

  // Show loading skeleton while data is being fetched
  if (!isReady) {
    return (
      <AuthenticatedClientLayout pageTitle={t("title")}>
        <div className="space-y-8">
          <div className="p-6 border rounded-md">
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
      </AuthenticatedClientLayout>
    );
  }

  return (
    <AuthenticatedClientLayout pageTitle={t("title")}>
      <div className="space-y-8">
        <ProfileHeader />
        <ProfileForm />
      </div>
    </AuthenticatedClientLayout>
  );
} 