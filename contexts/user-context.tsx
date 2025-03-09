"use client";

import { createClient } from "@/libs/supabase/client";
import { getStudent } from "@/app/actions/students";
import { getTeacher } from "@/app/actions/teachers";
import { getUser } from "@/app/actions/users";
import { createContext, useContext, useEffect, useState, ReactNode, JSX } from "react";

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
}

interface UserContextType {
  user: any | null;
  profile: UserData | null;
  hasAccess: boolean;
  isLoading: boolean;
  refetchUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  hasAccess: false,
  isLoading: true,
  refetchUserData: async () => {},
});

/**
 * UserProvider component that manages global user state
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render
 * @returns {JSX.Element} Provider component with user state
 */
export function UserProvider({ children }: { children: ReactNode }): JSX.Element {
  const supabase = createClient();
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserData | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      if (userData.user?.id) {
        // Get user data from database
        const userDbData = await getUser(userData.user.id);
        
        const studentData = await getStudent(userData.user.id);
        if (studentData) {
          // Extract relevant profile data
          setProfile({
            id: studentData.id,
            email: userData.user.email,
            firstName: userData.user.user_metadata?.firstName || userDbData?.firstName,
            lastName: userData.user.user_metadata?.lastName || userDbData?.lastName,
            avatarUrl: userData.user.user_metadata?.avatarUrl || userDbData?.avatarUrl,
            hasAccess: studentData.hasAccess,
            packageName: studentData.packageName || undefined,
            role: 'student',
            hasCompletedOnboarding: studentData.hasCompletedOnboarding,
            userId: userData.user.id,
            createdAt: studentData.createdAt ? studentData.createdAt.toISOString() : undefined,
            credits: studentData.credits,
            portugueseLevel: studentData.portugueseLevel as "beginner" | "intermediate" | "advanced" | "native" | "unknown" | undefined,
            nativeLanguage: studentData.nativeLanguage || undefined,
            otherLanguages: studentData.otherLanguages || [],
            learningGoals: studentData.learningGoals || [],
            timeZone: studentData.timeZone || undefined,
            country: userDbData?.country || undefined,
            gender: userDbData?.gender as "male" | "female" | "other" | "prefer_not_to_say" | undefined
          });
          setHasAccess(studentData.hasAccess);
        } else {
          const teacherData = await getTeacher(userData.user.id);
          if (teacherData) {
            // Extract relevant profile data
            setProfile({
              id: teacherData.id,
              email: userData.user.email,
              firstName: userDbData?.firstName || userData.user.user_metadata?.firstName,
              lastName: userDbData?.lastName || userData.user.user_metadata?.lastName,
              avatarUrl: userDbData?.avatarUrl || userData.user.user_metadata?.avatarUrl,
              role: 'teacher',
              userId: userData.user.id,
              createdAt: teacherData.createdAt ? teacherData.createdAt.toISOString() : undefined,
              biography: teacherData.biography || undefined,
              specialties: teacherData.specialties || [],
              languages: teacherData.languages || [],
              country: userDbData?.country || undefined,
              gender: userDbData?.gender as "male" | "female" | "other" | "prefer_not_to_say" | undefined
            });
          } else if (userDbData) {
            // If neither student nor teacher, just use the user data
            setProfile({
              ...userDbData,
              email: userData.user.email,
              role: userDbData.role?.toLowerCase() || 'user',
              userId: userData.user.id,
              createdAt: userDbData.createdAt ? userDbData.createdAt.toISOString() : undefined,
              firstName: userDbData.firstName || undefined,
              lastName: userDbData.lastName || undefined,
              avatarUrl: userDbData.avatarUrl || undefined,
              country: userDbData.country || undefined,
              gender: userDbData.gender as "male" | "female" | "other" | "prefer_not_to_say" | undefined
            });
          }
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoading(false);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserData();
    });

    // Initial fetch
    fetchUserData();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        profile, 
        hasAccess, 
        isLoading,
        refetchUserData: fetchUserData
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