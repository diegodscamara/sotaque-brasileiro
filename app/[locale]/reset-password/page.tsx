"use client";

import ResetPasswordForm from "@/components/auth/reset-password-form";
import { createClient } from "@/libs/supabase/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useStudentApi from "@/hooks/useStudentApi";
import useUserApi from "@/hooks/useUserApi";

export default function ResetPassword() {
  const supabase = createClient();
  const { getStudent } = useStudentApi();
  const { getUser } = useUserApi();
  const router = useRouter();
  // Check user authentication status and redirect if needed
  useEffect(() => {
    const checkUser = async (): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const role = user.user_metadata?.role;
        const userData = await getUser(user.id);

        if (!userData) return;

        switch (role) {
          case "ADMIN":
            router.push("/admin");
            break;
          case "TEACHER":
            router.push("/dashboard");
            break;
          case "STUDENT": {
            const studentData = await getStudent(user.id);
            router.push(studentData?.hasAccess ? "/dashboard" : "/#pricing");
            break;
          }
        }
      }
    };

    checkUser();
  }, [getStudent, getUser, router, supabase.auth]);

  return (
    <section className="flex justify-center items-center mx-auto py-24 w-full h-full container">
      <ResetPasswordForm />
    </section>
  );
} 