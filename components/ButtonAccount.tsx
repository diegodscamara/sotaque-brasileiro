"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreditCard, SignOut, UserCircle, Gauge, Notebook, ChartLineUp } from "@phosphor-icons/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";

import apiClient from "@/libs/api";
import { createClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";
import { getStudent } from "@/app/actions/students";
import { getTeacher } from "@/app/actions/teachers";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/actions/auth";
import config from "@/config";// Extend the Supabase User type
import { getUser } from "@/app/actions/users";

interface UserData {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  hasAccess?: boolean;
  packageName?: string;
  role?: string;
  hasCompletedOnboarding?: boolean;
}

/**
 * ButtonAccount component provides user account actions dropdown
 * @component
 * @returns {JSX.Element} Account dropdown with profile, billing, and sign-out options
 */
const ButtonAccount = (): JSX.Element => {
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations('shared.nav-user');
  const [profile, setProfile] = useState<UserData | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error(authError.message);
      }
      
      if (!authUser?.id) {
        setIsLoading(false);
        return;
      }
      
      // Get user data from database
      const userData = await getUser(authUser.id);
      if (!userData) {
        setIsLoading(false);
        return;
      }
      
      // Check if user is a student
      const studentData = await getStudent(authUser.id);
      if (studentData) {
        setProfile({
          ...userData, // Use userData for profile info
          id: studentData.id,
          role: 'STUDENT',
          packageName: studentData.packageName ?? undefined,
          hasAccess: studentData.hasAccess || false,
          hasCompletedOnboarding: studentData.hasCompletedOnboarding
        });
        setHasAccess(studentData.hasAccess || false);
        setIsLoading(false);
        return;
      }
      
      // If not a student, check if user is a teacher
      const teacherData = await getTeacher(userData.id);
      if (teacherData) {
        setProfile({
          ...userData, // Use userData for profile info
          id: teacherData.id,
          role: 'TEACHER'
        });
      } else {
        // If neither student nor teacher, just use the user data
        setProfile({
          ...userData,
          role: userData.role || 'USER'
        });
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setIsLoading(false);
    }
  }, [supabase]);

  const handleBilling = useCallback(async () => {
    try {
      const { url }: { url: string } = await apiClient.post(
        "/stripe/create-portal",
        {
          returnUrl: window.location.href,
        }
      );

      router.push(url);
    } catch (e) {
      console.error(e);
    }
  }, [router]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    // Force a page reload to clear any cached state
    window.location.href = '/';
  }, []);

  const handleUpgrade = useCallback(async () => {
    try {
      const { url }: { url: string } = await apiClient.post(
        "/stripe/create-checkout",
        {
          priceId:
            profile?.packageName === "Explorer" ||
              profile?.packageName === "Enthusiast"
              ? config.stripe.plans.find(
                (plan) =>
                  plan.name === "Master" && plan.interval === "monthly"
              )?.priceId
              : config.stripe.plans.find(
                (plan) =>
                  plan.name === "Enthusiast" && plan.interval === "monthly"
              )?.priceId,
          successUrl: window.location.href + "/dashboard",
          cancelUrl: window.location.href,
          mode: "subscription",
        }
      );

      router.push(url);
    } catch (e) {
      console.error(e);
    }
  }, [profile, router]);

  // Enhanced avatar fallback with initials
  const avatarFallback = useMemo(() => {
    if (profile?.firstName) {
      if (profile.lastName) {
        // First letter of first name + first letter of last name
        return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
      }
      // Just first letter of first name if no last name
      return profile.firstName.charAt(0).toUpperCase();
    }
    // First letter of email if no name
    return profile?.email?.charAt(0).toUpperCase() || "";
  }, [profile?.firstName, profile?.lastName, profile?.email]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) {
    return (
      <div className="bg-gray-200 dark:bg-gray-600 rounded-full w-8 h-8 animate-pulse" 
           aria-label={t('loading')} />
    );
  }

  return (
    <DropdownMenu aria-label={t('accountMenu')} aria-busy={false} aria-live="polite" aria-atomic={true}>
      <DropdownMenuTrigger className="rounded-full hover:scale-105 transition-transform duration-200" aria-label={t('accountMenu')} aria-haspopup="dialog" aria-expanded={true} aria-controls="account-menu" role="button" tabIndex={0} aria-busy={false}>
        <Avatar>
          <AvatarImage
            src={profile?.avatarUrl}
            alt={profile?.firstName}
            width={32}
            height={32}
            loading="eager"
            aria-hidden="true"
            className="rounded-full"
            sizes="32x32"
            fetchPriority="high"
          />
          <AvatarFallback className="bg-gray-200 dark:bg-gray-600 rounded-full" aria-hidden="true">{avatarFallback}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white dark:bg-gray-700 rounded-lg w-[--radix-dropdown-menu-trigger-width] min-w-56 transition-opacity duration-200" side="bottom" align="end" aria-label={t('accountMenu')} aria-busy={false}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-sm text-left">
            <Avatar className="rounded-lg w-8 h-8">
              <AvatarImage src={profile?.avatarUrl} alt={profile?.firstName} />
              <AvatarFallback className="bg-gray-200 dark:bg-gray-600 rounded-lg">{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex-1 grid text-sm text-left leading-tight">
              <span className="font-semibold truncate">{profile?.firstName} {profile?.lastName}</span>
              <span className="text-xs truncate">{profile?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />

        <DropdownMenuGroup aria-label={t('accountMenu')}>
          {hasAccess && (
            <DropdownMenuItem
              className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
              onClick={handleBilling}
              aria-label={t('billing')}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleBilling();
                }
              }}
            >
              <CreditCard className="w-5 h-5" aria-hidden="true" />
              {t('billing')}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
            onClick={() => router.push("/profile")}
            aria-label={t('profile')}
            role="menuitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push("/profile");
              }
            }}
          >
            <UserCircle className="w-5 h-5" aria-hidden="true" />
            {t('profile')}
          </DropdownMenuItem>

          {profile?.role === 'STUDENT' && profile.hasCompletedOnboarding === false && (
            <DropdownMenuItem
              className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
              onClick={() => router.push("/student/onboarding")}
              aria-label={t('onboarding')}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  router.push("/student/onboarding");
                }
              }}
            >
              <Notebook className="w-5 h-5" aria-hidden="true" />
              {t('onboarding')}
            </DropdownMenuItem>
          )}

          {profile?.role === 'STUDENT' && profile.hasCompletedOnboarding === true && hasAccess && (
            <DropdownMenuItem
              className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
              onClick={() => router.push("/student/dashboard")}
              aria-label={t('dashboard')}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  router.push("/student/dashboard");
                }
              }}
            >
              <ChartLineUp className="w-5 h-5" aria-hidden="true" />
              {t('dashboard')}
            </DropdownMenuItem>
          )}

          {profile?.role === 'ADMIN' && (
            <DropdownMenuItem
              className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
              onClick={() => router.push("/admin")}
              aria-label={t('admin')}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  router.push("/admin");
                }
              }}
            >
              <Gauge className="w-5 h-5" aria-hidden="true" />
              {t('admin')}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />

          <DropdownMenuItem
            className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
            onClick={handleSignOut}
            aria-label={t('sign-out')}
            role="menuitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSignOut();
              }
            }}
          >
            <SignOut className="w-5 h-5" aria-hidden="true" />
            {t('sign-out')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ButtonAccount;
