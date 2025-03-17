/**
 * User related type definitions
 * @module types/User
 */

import { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Represents the roles a user can have
 */
export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  ADMIN = "admin",
}

/**
 * Represents the gender options for users
 */
export enum UserGender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
  PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

/**
 * Represents the base user information extending Supabase User
 */
export interface User extends SupabaseUser {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  country?: string | null;
  gender?: UserGender | null;
  timezone?: string | null;
  hasAccess: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents the data required to create a new user
 */
export interface CreateUserInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  country?: string;
  gender?: UserGender;
}

/**
 * Represents the data required to update a user's profile
 */
export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  country?: string;
  gender?: UserGender;
  timezone?: string;
}

/**
 * Represents the user's authentication state
 */
export interface UserAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: Error | null;
}

/**
 * Represents the user's session information
 */
export interface UserSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Represents the filters for searching users
 */
export interface UserSearchFilters {
  role?: UserRole;
  country?: string;
  hasAccess?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * Represents the sorting options for user lists
 */
export interface UserSortOptions {
  field: "createdAt" | "firstName" | "lastName" | "email";
  direction: "asc" | "desc";
}

/**
 * Represents the pagination options for user lists
 */
export interface UserPaginationOptions {
  page: number;
  limit: number;
}

/**
 * Represents user notification preferences
 */
export interface UserNotificationPreferences {
  email: {
    classReminders: boolean;
    marketingEmails: boolean;
    newsletterSubscription: boolean;
  };
  push: {
    classReminders: boolean;
    newMessages: boolean;
    systemUpdates: boolean;
  };
}

/**
 * Represents user activity log entry
 */
export interface UserActivityLog {
  id: string;
  userId: string;
  action: "login" | "logout" | "profile_update" | "password_change" | "email_change";
  timestamp: Date;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Represents user security settings
 */
export interface UserSecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod?: "email" | "authenticator";
  lastPasswordChange?: Date;
  passwordResetRequired: boolean;
  loginAttempts: number;
  lastLoginAttempt?: Date;
}

/**
 * Represents the full user profile with all related information
 */
export interface UserComplete extends User {
  notificationPreferences: UserNotificationPreferences;
  securitySettings: UserSecuritySettings;
  student?: {
    id: string;
    credits: number;
    hasCompletedOnboarding: boolean;
  } | null;
  teacher?: {
    id: string;
    biography: string | null;
    rating: number | null;
  } | null;
} 