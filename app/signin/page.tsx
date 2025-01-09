"use client";

import SignInForm from "@/components/auth/SignInForm";

export default function SignIn() {

  return (
    <div className="flex justify-center items-center p-6 md:p-10 w-full min-h-svh">
      <div className="w-full max-w-sm">
        <SignInForm />
      </div>
    </div>

  );
}
