import { User as SupabaseUser } from "@supabase/supabase-js";

export interface User extends SupabaseUser {
  avatarUrl?: string; // Add the avatarUrl property
  hasAccess?: boolean;
} 