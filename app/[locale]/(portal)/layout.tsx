import { ReactNode } from "react";
import config from "@/config";
import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/app/actions/users";
import { getStudent } from "@/app/actions/students";

/**
 * Authenticated layout component that protects routes for logged-in users
 * Ensures users are authenticated and students have completed onboarding
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render
 * @returns {ReactNode} The protected layout with children
 */
export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactNode> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect(config.auth.loginUrl);
  }

  // Get user data using server action
  const dbUser = await getCurrentUser();

  // If user not found in database, redirect to login
  if (!dbUser) {
    redirect(config.auth.loginUrl);
  }

  // If user is a student, check onboarding status and access
  if (dbUser.role === Role.STUDENT) {
    // Get student data using server action
    const student = await getStudent(user.id);

    // If student data not found, redirect to login
    if (!student) {
      redirect(config.auth.loginUrl);
    }

    // If student hasn't completed onboarding or doesn't have access, redirect to onboarding
    if (!student.hasCompletedOnboarding || !student.hasAccess) {
      console.log("Redirecting to onboarding:", {
        hasCompletedOnboarding: student.hasCompletedOnboarding,
        hasAccess: student.hasAccess,
        studentId: student.id,
        userId: student.userId
      });
      redirect("/onboarding/student");
    }
  }

  return children;
} 