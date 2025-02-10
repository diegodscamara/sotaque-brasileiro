"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreditCard, SignOut, UserCircle } from "@phosphor-icons/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCallback, useEffect, useMemo, useState } from "react";

import { User } from "@supabase/supabase-js";
import apiClient from "@/libs/api";
import { createClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";
import useStudentApi from "@/hooks/useStudentApi";
import useTeacherApi from "@/hooks/useTeacherApi";
import { useTranslations } from "next-intl";

interface UserData {
  id: string;
  hasAccess?: boolean;
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
  const { getStudent } = useStudentApi();
  const { getTeacher } = useTeacherApi();

  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const fetchUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }, [supabase]);

  const fetchUserData = useCallback(async () => {
    if (!user?.id) return;

    const studentData = await getStudent(user.id);
    if (studentData) {
      setUserData(studentData);
    } else {
      const teacherData = await getTeacher(user.id);
      setUserData(teacherData);
    }
  }, [user?.id, getStudent, getTeacher]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/");
    window.location.reload();
  }, [supabase, router]);

  const handleBilling = useCallback(async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const avatarFallback = useMemo(() => user?.email?.charAt(0) || "", [user?.email]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id, fetchUserData]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full" aria-label="Account menu">
        <Avatar>
          <AvatarImage
            src={user?.user_metadata?.avatar_url}
            alt="Profile picture"
          />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        {isLoading && (
          <span className="loading loading-spinner loading-xs" aria-hidden="true" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push("/profile")}
            aria-label="Profile"
          >
            <UserCircle className="w-5 h-5" />
            {t('profile')}
          </DropdownMenuItem>
          {userData?.hasAccess && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleBilling}
              aria-label="Billing"
            >
              <CreditCard className="w-5 h-5" />
              {t('billing')}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleSignOut}
            aria-label="Sign out"
          >
            <SignOut className="w-5 h-5" />
            {t('sign-out')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ButtonAccount;
