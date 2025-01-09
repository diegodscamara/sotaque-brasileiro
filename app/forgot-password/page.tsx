"use client";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPassword() {

  return (
    <div className="flex justify-center items-center p-6 md:p-10 w-full min-h-svh">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
} 