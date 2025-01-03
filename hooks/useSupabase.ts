"use client";

import { SupabaseContext } from "@/app/providers/SupabaseProvider";
import { useContext } from "react";

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
} 