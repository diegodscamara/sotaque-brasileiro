"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@phosphor-icons/react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/libs/supabase/client";
import logo from "@/app/icon.png";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function SignIn() {
  const t = useTranslations("auth.sign-in");
  const tShared = useTranslations("shared");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.push("/dashboard");
    };
    checkUser();
  }, [router, supabase.auth]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, signIn: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An unknown error occurred");
      } else {
        router.push(data.redirectUrl);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative flex flex-col justify-center items-center gap-6 mx-auto px-4 py-20 md:py-24 lg:pb-16 max-w-7xl h-full container"
    >
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        aria-label="Logo"
        aria-roledescription="Logo"
      >
        {/* Logo */}
        <Link
          className="flex items-center gap-2 shrink-0"
          href="/"
          title={`${tShared("appName")} homepage`}
        >
          <Image
            src={logo}
            alt={`${tShared("appName")} logo`}
            className="w-8"
            placeholder="blur"
            priority={true}
            width={32}
            height={32}
          />
          <span className="font-extrabold text-lg">{tShared("appName")}</span>
        </Link>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
      >
        <Card className="bg-gray-100 dark:bg-gray-700 rounded-lg w-full max-w-md">
          <CardHeader className="items-center">
            <CardTitle className="font-semibold text-lg text-center leading-8">{t("title")}</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 text-sm text-center leading-none">
              {t("subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form onSubmit={handleSignIn}>
              <div className="flex flex-col gap-6">
                <div className="gap-2 grid">
                  <Label className="text-gray-800 dark:text-gray-200 text-sm leading-none" htmlFor="email">{t("email")}</Label>
                  <Input
                    className="bg-transparent dark:bg-transparent border-gray-300 dark:border-gray-600 placeholder:font-normal text-gray-800 dark:text-gray-200 dark:placeholder:text-gray-400 placeholder:text-gray-500 placeholder:text-sm placeholder:leading-none"
                    id="email"
                    name="email"
                    autoComplete="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="gap-2 grid">
                  <div className="flex flex-row flex-wrap justify-between items-center gap-2">
                    <Label className="text-gray-800 dark:text-gray-200 text-sm leading-none" htmlFor="password">{t("password")}</Label>
                    <Link href="/forgot-password" className="text-gray-600 dark:text-gray-300 text-sm leading-none">
                      {t("forgotPassword")}
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      className="bg-transparent dark:bg-transparent border-gray-300 dark:border-gray-600 placeholder:font-normal text-gray-800 dark:text-gray-200 dark:placeholder:text-gray-400 placeholder:text-gray-500 placeholder:text-sm placeholder:leading-none"
                      id="password"
                      name="password"
                      autoComplete="current-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {password && (
                      <button type="button" className="top-1/2 right-2 absolute -translate-y-1/2 transform" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm">
                      {error}
                    </div>
                  )}
                </div>
                <Button variant="default" type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  ) : null}
                  {t("signIn")}
                </Button>
              </div>
            </form>

            <div className="flex justify-center items-center gap-2 w-full">
              <Separator className="bg-gray-300 dark:bg-gray-500 w-1/4" />
              <p className="font-normal text-gray-600 dark:text-gray-300 text-sm leading-5">
                {t("continue")}
              </p>
              <Separator className="bg-gray-300 dark:bg-gray-500 w-1/4" />
            </div>

            <Button onClick={handleGoogleSignIn} variant="outline" className="bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-transparent border-gray-300 dark:border-gray-600 w-full" disabled={loading}>
              <GoogleLogo className="mr-2 w-4 h-4" />
              {t("signInWithGoogle")}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-row flex-wrap justify-center items-center gap-1 text-gray-600 dark:text-gray-300 text-sm text-center leading-none">
            <p>
              {t("noAccount")}
            </p>
            <Link href="/signup" className="underline underline-offset-4">
              {t("signUp")}
            </Link>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
        className="flex flex-row flex-wrap justify-center items-center gap-1 font-normal text-gray-600 dark:text-gray-400 text-sm text-center leading-4"
        aria-label="Disclaimer"
        aria-roledescription="Disclaimer"
      >
        <p>
          {t("disclaimer")}
        </p>
        <Link href="/terms-of-service" className="underline underline-offset-4" aria-label="Terms of Service" aria-roledescription="Terms of Service">
          {t("termsOfService")}
        </Link>
        <p>
          {t("and")}
        </p>
        <Link href="/privacy-policy" className="underline underline-offset-4" aria-label="Privacy Policy" aria-roledescription="Privacy Policy">
          {t("privacyPolicy")}
        </Link>
      </motion.footer>
    </motion.section>
  );
}
