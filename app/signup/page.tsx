"use client";

import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUp() {
    return (
        <div className="flex justify-center items-center p-6 md:p-10 w-full min-h-svh">
            <div className="w-full max-w-sm">
                <SignUpForm />
            </div>
        </div>
    );
} 