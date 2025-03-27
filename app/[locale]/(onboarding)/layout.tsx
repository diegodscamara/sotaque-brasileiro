import { ReactNode, Suspense } from "react";
import Header from "@/components/auth/Header";
import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/users";
import { getStudent } from "@/app/actions/students";
import config from "@/config";

/**
 * Layout component for student onboarding
 * Ensures only students who need to complete onboarding can access this page
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render
 * @returns {ReactNode} The protected layout with children
 */
export default async function OnboardingLayout({ children }: { children: ReactNode }): Promise<ReactNode> {
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
  const student = await getStudent(user.id);

  // If user not found in database, redirect to login
  if (!dbUser || !student) {
    redirect(config.auth.loginUrl);
  }

  // If student has completed onboarding and has access, redirect to dashboard
  if (student.hasCompletedOnboarding && student.hasAccess) {
    redirect("/dashboard");
  }

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main className="flex flex-col justify-center items-center mx-auto h-full">
        {children}
      </main>
    </>
  );
}
