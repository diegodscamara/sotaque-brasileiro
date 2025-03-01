import { ReactNode } from "react";
import config from "@/config";
import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/app/actions/users";
import { getStudent } from "@/app/actions/students";
// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of /dashboard in /app/dashboard/*** pages
// You can also add custom static UI elements like a Navbar, Sidebar, Footer, etc..
// See https://sotaquebrasileiro.com/docs/tutorials/private-page

/**
 * Private layout component that protects dashboard routes
 * Ensures users are authenticated and students have completed onboarding
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render
 * @returns {ReactNode} The protected layout with children
 */
export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
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
      redirect("/student/onboarding");
    }
  }

  return children;
}
