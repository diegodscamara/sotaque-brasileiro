import React from "react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

// Auth
import { createClient } from "@/libs/supabase/server";
import { prisma } from "@/libs/prisma";
import { Role } from "@prisma/client";

/**
 * Admin layout component
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {Promise<React.JSX.Element>} The admin layout component
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.JSX.Element> {
  const t = await getTranslations("admin");
  
  // Check if user is authenticated and is an admin
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/signin");
  }
  
  // Check if user is an admin
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true }
  });
  
  if (userData?.role !== Role.ADMIN) {
    redirect("/dashboard");
  }
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-b">
        <div className="mx-auto px-4 py-4 container">
          <h1 className="font-semibold text-xl">{t("title")}</h1>
        </div>
      </div>
      
      {children}
    </div>
  );
} 