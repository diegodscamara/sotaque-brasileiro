"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreditCard, SignOut, UserCircle } from "@phosphor-icons/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCallback, useEffect, useMemo, useState } from "react";

import { User as SupabaseUser } from "@supabase/supabase-js";
import apiClient from "@/libs/api";
import { createClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";
import { getStudent } from "@/app/actions/students";
import { getTeacher } from "@/app/actions/teachers";
import { useTranslations } from "next-intl";

// Extend the Supabase User type
interface User extends SupabaseUser {
  avatarUrl?: string; // Add avatarUrl property
  firstName?: string; // Add firstName property
  lastName?: string; // Add lastName property
}

interface UserData {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  hasAccess?: boolean;
  packageName?: string;
  role?: string;
}

/**
 * ButtonAccount component provides user account actions dropdown
 * @component
 * @returns {JSX.Element} Account dropdown with profile, billing, and sign-out options
 */
const ButtonAccount = () => {
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations('shared.nav-user');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserData | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  const fetchUser = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    setUser(userData.user);

    if (userData.user?.id) {
      const studentData = await getStudent(userData.user.id);
      if (studentData) {
        setProfile(studentData as unknown as UserData);
        setHasAccess(studentData.hasAccess || false);
      } else {
        const teacherData = await getTeacher(userData.user.id);
        if (teacherData) {
          setProfile(teacherData as unknown as UserData);
        }
      }
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
    await supabase.auth.signOut();
    router.push("/");
  }, [supabase, router]);

  const handleUpgrade = useCallback(async () => {
    try {
      const { url }: { url: string } = await apiClient.post(
        "/stripe/create-checkout",
        {
          priceId:
            profile?.packageName === "Explorer" ||
            profile?.packageName === "Enthusiast"
              ? config.stripe.plans.find(
                  (plan: { name: string; interval: string }) => 
                    plan.name === "Master" && plan.interval === "monthly"
                )?.priceId
              : config.stripe.plans.find(
                  (plan: { name: string; interval: string }) =>
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

  const avatarFallback = useMemo(() => user?.email?.charAt(0).toUpperCase() || "", [user?.email]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <DropdownMenu aria-label={t('accountMenu')} aria-busy={false} aria-live="polite" aria-atomic={true}>
      <DropdownMenuTrigger className="rounded-full hover:scale-105 transition-transform duration-200" aria-label={t('accountMenu')} aria-haspopup="dialog" aria-expanded={true} aria-controls="account-menu" role="button" tabIndex={0} aria-busy={false}>
        <Avatar>
          <AvatarImage
            src={user?.avatarUrl}
            alt={user?.firstName}
            width={32}
            height={32}
            loading="eager"
            aria-hidden="true"
            className="rounded-full"
            sizes="32x32"
            fetchPriority="high"
          />
          <AvatarFallback className="bg-gray-200 dark:bg-gray-600" aria-hidden="true">{avatarFallback}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white dark:bg-gray-700 rounded-lg w-[--radix-dropdown-menu-trigger-width] min-w-56 transition-opacity duration-200" side="bottom" align="end" aria-label={t('accountMenu')} aria-busy={false}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-sm text-left">
            <Avatar className="rounded-lg w-8 h-8">
              <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
              <AvatarFallback className="rounded-lg">{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex-1 grid text-sm text-left leading-tight">
              <span className="font-semibold truncate">{user?.firstName} {user?.lastName}</span>
              <span className="text-xs truncate">{user?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

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

          <DropdownMenuSeparator />

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
