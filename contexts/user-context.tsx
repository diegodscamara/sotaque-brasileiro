"use client";

import { createClient } from "@/libs/supabase/client";
import { getStudent } from "@/app/actions/students";
import { getTeacher } from "@/app/actions/teachers";
import { getUser } from "@/app/actions/users";
import { createContext, useContext, useEffect, useState, ReactNode, JSX, useCallback, useRef } from "react";

interface UserData {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  hasAccess?: boolean;
  packageName?: string;
  role?: string;
  hasCompletedOnboarding?: boolean;
  userId?: string;
  createdAt?: string;
  credits?: number;
  // Student-specific properties
  portugueseLevel?: "beginner" | "intermediate" | "advanced" | "native" | "unknown";
  nativeLanguage?: string;
  otherLanguages?: string[];
  learningGoals?: string[];
  timeZone?: string;
  // Teacher-specific properties
  biography?: string;
  specialties?: string[];
  languages?: string[];
  // User properties
  country?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  // Package and payment properties
  customerId?: string;
  priceId?: string;
}

interface UserContextType {
  user: any | null;
  profile: UserData | null;
  hasAccess: boolean;
  isLoading: boolean;
  error: Error | null;
  refetchUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  hasAccess: false,
  isLoading: true,
  error: null,
  refetchUserData: async () => {},
});

// Add cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Helper function to ensure dates are converted to strings
const formatDateToString = (date: Date | string | null | undefined): string | undefined => {
  if (!date) return undefined;
  if (date instanceof Date) return date.toISOString();
  return String(date);
};

// Helper function to normalize role names
const normalizeRole = (role: string | undefined): string | undefined => {
  if (!role) return undefined;
  return role.toLowerCase();
};

/**
 * UserProvider component that manages global user state
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render
 * @returns {JSX.Element} Provider component with user state
 */
export function UserProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserData | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Add cache ref
  const cacheRef = useRef<{
    timestamp: number;
    data: UserData | null;
  }>({ timestamp: 0, data: null });

  const fetchUserData = useCallback(async (force: boolean = false) => {
    // Check cache first
    const now = Date.now();
    if (!force && cacheRef.current.data && (now - cacheRef.current.timestamp) < CACHE_DURATION) {
      setProfile(cacheRef.current.data);
      setHasAccess(!!cacheRef.current.data?.hasAccess);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();

      if (!supabaseUser) {
        setUser(null);
        setProfile(null);
        setHasAccess(false);
        cacheRef.current = { timestamp: now, data: null };
        return;
      }

      // Get user data
      const userData = await getUser(supabaseUser.id);
      setUser(userData);

      // Get role-specific data
      let profileData: any = null;
      const normalizedRole = normalizeRole(userData?.role);
      
      if (userData && normalizedRole === "student") {
        profileData = await getStudent(userData.id);
      } else if (userData && normalizedRole === "teacher") {
        profileData = await getTeacher(userData.id);
      }

      // Merge user data with role-specific data and ensure proper types
      const mergedProfile: UserData = {
        ...userData,
        ...(profileData || {}),
        createdAt: formatDateToString(profileData?.createdAt || userData?.createdAt),
        packageName: profileData?.packageName || undefined,
        role: normalizedRole
      };

      // Update cache
      cacheRef.current = {
        timestamp: now,
        data: mergedProfile
      };

      setProfile(mergedProfile);
      setHasAccess(!!mergedProfile?.hasAccess);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch user data"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const supabase = createClient();
    
    // Set up real-time subscription for user profile changes
    const userChannel = supabase.channel('user-profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user?.id}`
        },
        () => {
          // Invalidate cache and refetch on changes
          fetchUserData(true);
        }
      )
      .subscribe();

    // Set up real-time subscription for role-specific changes
    const roleChannel = user?.role ? supabase.channel('role-specific-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: user.role === 'student' ? 'students' : 'teachers',
          filter: `userId=eq.${user.id}`
        },
        () => {
          // Invalidate cache and refetch on changes
          fetchUserData(true);
        }
      )
      .subscribe()
    : null;

    // Initial fetch
    fetchUserData();

    return () => {
      userChannel.unsubscribe();
      if (roleChannel) roleChannel.unsubscribe();
    };
  }, [fetchUserData, user?.id, user?.role]);

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        hasAccess, 
        isLoading,
        error,
        refetchUserData: () => fetchUserData(true)
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to access the user context
 * @returns {UserContextType} User context values
 */
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
} 