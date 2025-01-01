"use client";

import React, { useState } from "react";

import ButtonSupport from "@/components/ButtonSupport";
import Image from "next/image";
import Link from "next/link";
import config from "@/config";
import { createClient } from "@/libs/supabase/client";
import logo from "@/app/icon.png";
import { toast } from "react-hot-toast";

const supabase = createClient();

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignup = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
    { type }: { type: string }
  ) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (type === "magic_link") {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        toast.success("Magic link sent!");
      } else if (type === "oauth") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
        });
        if (error) throw error;
        toast.success("Redirecting to Google...");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8"
      data-theme={config.colors.theme}
    >
      <div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-base-content">
          Sign in to {config.appName}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-base-100 px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <form
            className="space-y-6"
            onSubmit={(e) => handleSignup(e, { type: "magic_link" })}
          >
            <label className="input input-bordered flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
              </svg>
              <input
                className="grow"
                id="email"
                name="email"
                type="email"
                required
                value={email}
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <div>
              <button
                type="submit"
                className="btn btn-accent w-full"
                disabled={isLoading}
              >
                {isLoading && (
                  <span className="loading loading-spinner loading-xs"></span>
                )}
                Send Magic Link
              </button>
            </div>
          </form>

          <div>
            <div className="relative mt-10">
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center"
              >
                <div className="w-full border-t border-base-300" />
              </div>
              <div className="relative flex justify-center text-sm font-medium">
                <span className="bg-base-100 px-6 text-base-content">
                  or
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={(e) => handleSignup(e, { type: "oauth" })}
                className="btn btn-outline w-full"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
                <span className="text-sm font-semibold">
                  Continue with Google
                </span>
              </button>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-xs text-center text-base-content">
              By signing in, you agree to {config.appName}{" "}
              <Link href="/tos" className="link">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="link">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Link href="/" className="btn btn-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                clipRule="evenodd"
              />
            </svg>
            Home
          </Link>

          <ButtonSupport />
        </div>
      </div>
    </main>
  );
}
