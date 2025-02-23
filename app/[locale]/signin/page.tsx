"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import React, { JSX } from "react";
import { validateEmail, validatePassword } from "@/libs/utils/validation";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/libs/supabase/client";
import { getStudent } from "@/app/actions/students";
import { getUser } from "@/app/actions/users";
import logo from "@/app/icon.png";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

/**
 * SignIn component handles user authentication and sign-in functionality
 * @returns {JSX.Element} The SignIn form component
 */
export default function SignIn(): JSX.Element {
  // Translations
  const t = useTranslations("auth.sign-in");
  const tShared = useTranslations("shared");
  const tErrors = useTranslations("errors");

  // Form state
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    showPassword: false,
  });

  // UI state
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  // Hooks
  const router = useRouter();
  const supabase = createClient();
  const sectionRef = React.useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true });

  /**
   * Handles input change events
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  /**
   * Toggles password visibility
   */
  const togglePasswordVisibility = (): void => {
    setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  /**
   * Validates form inputs
   */
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = tErrors("invalidEmail");
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = tErrors("invalidPassword");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   */
  const handleSignIn = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          signIn: true
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setErrors({ general: result.error || tErrors("unknownError") });
      } else {
        router.push(result.data?.redirectUrl || '/dashboard');
      }
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : tErrors("unknownError")
      });
    } finally {
      setLoading(false);
    }
  };

  // Check user authentication status and redirect if needed
  React.useEffect(() => {
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
  }, [router, supabase.auth]);

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
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    aria-invalid={errors.email ? "true" : undefined}
                    aria-errormessage={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <div id="email-error" role="alert" className="text-red-500 text-sm">
                      {errors.email}
                    </div>
                  )}
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
                      type={formData.showPassword ? "text" : "password"}
                      placeholder={t("passwordPlaceholder")}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      aria-invalid={errors.password ? "true" : undefined}
                      aria-errormessage={errors.password ? "password-error" : undefined}
                    />
                    {formData.password && (
                      <button type="button" className="top-1/2 right-2 absolute -translate-y-1/2 transform" onClick={togglePasswordVisibility}>
                        {formData.showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                  {errors.password && (
                    <div id="password-error" role="alert" className="text-red-500 text-sm">
                      {errors.password}
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
