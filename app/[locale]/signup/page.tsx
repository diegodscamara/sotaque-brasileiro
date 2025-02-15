"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import React from "react";
import { createClient } from "@/libs/supabase/client";
import logo from "@/app/icon.png";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function SignUp() {
    const t = useTranslations("auth.sign-up");
    const tShared = useTranslations("shared");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [isTypingPassword, setIsTypingPassword] = useState(false);
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

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== repeatPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    signIn: false,
                    role: "STUDENT",
                }),
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

    const getPasswordStrength = (password: string) => {
        if (password.length < 6) return { strength: "Too short", color: "text-red-500" };
        if (password.length < 8) return { strength: "Weak", color: "text-orange-500" };
        if (password.match(/[A-Z]/) && password.match(/[0-9]/)) return { strength: "Strong", color: "text-green-500" };
        return { strength: "Medium", color: "text-yellow-500" };
    };

    const { strength: passwordStrength, color: strengthColor } = getPasswordStrength(password);
    const isPasswordStrong = passwordStrength !== "Too short" && passwordStrength !== "Weak";
    const passwordsMatch = password === repeatPassword;

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
                <Link
                    className="flex items-center gap-2 shrink-0"
                    href="/"
                    aria-label={`${tShared("appName")} homepage`}
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
                        <CardTitle className="font-semibold text-lg text-center leading-8">
                            {t("title")}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300 text-sm text-center leading-none">
                            {t("subtitle")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <form onSubmit={handleSignUp}>
                            <div className="flex flex-col gap-6">
                                <div className="gap-2 grid">
                                    <Label className="text-gray-800 dark:text-gray-200 text-sm leading-none" htmlFor="email">
                                        {t("email")}
                                    </Label>
                                    <Input
                                        className="bg-transparent dark:bg-transparent border-gray-300 dark:border-gray-600 placeholder:font-normal text-gray-800 dark:text-gray-200 dark:placeholder:text-gray-400 placeholder:text-gray-500 placeholder:text-sm placeholder:leading-none"
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder={t("emailPlaceholder")}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="gap-2 grid">
                                    <Label className="text-gray-800 dark:text-gray-200 text-sm leading-none" htmlFor="password">
                                        {t("password")}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            className="bg-transparent dark:bg-transparent border-gray-300 dark:border-gray-600 placeholder:font-normal text-gray-800 dark:text-gray-200 dark:placeholder:text-gray-400 placeholder:text-gray-500 placeholder:text-sm placeholder:leading-none"
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            placeholder={t("passwordPlaceholder")}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setIsTypingPassword(true);
                                            }}
                                            required
                                        />
                                        {password && (
                                            <button
                                                type="button"
                                                className="top-1/2 right-2 absolute -translate-y-1/2 transform"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                                                aria-pressed={showPassword}
                                            >
                                                {showPassword ? (
                                                    <EyeSlash size={16} aria-hidden="true" />
                                                ) : (
                                                    <Eye size={16} aria-hidden="true" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    {isTypingPassword && (
                                        <div className={`text-sm ${strengthColor}`} role="alert">
                                            {t("passwordStrength")}: {passwordStrength}
                                        </div>
                                    )}
                                </div>
                                {isPasswordStrong && (
                                    <div className="gap-2 grid">
                                        <Label className="text-gray-800 dark:text-gray-200 text-sm leading-none" htmlFor="repeat-password">
                                            {t("repeatPassword")}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                className="bg-transparent dark:bg-transparent border-gray-300 dark:border-gray-600 placeholder:font-normal text-gray-800 dark:text-gray-200 dark:placeholder:text-gray-400 placeholder:text-gray-500 placeholder:text-sm placeholder:leading-none"
                                                id="repeat-password"
                                                name="repeat-password"
                                                type={showRepeatPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                placeholder={t("passwordPlaceholder")}
                                                value={repeatPassword}
                                                onChange={(e) => setRepeatPassword(e.target.value)}
                                                required
                                            />
                                            {password && <button
                                                type="button"
                                                className="top-1/2 right-2 absolute -translate-y-1/2 transform"
                                                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                                                aria-label={showRepeatPassword ? t("hidePassword") : t("showPassword")}
                                                aria-pressed={showRepeatPassword}
                                            >
                                                {showRepeatPassword ? (
                                                    <EyeSlash size={16} aria-hidden="true" />
                                                ) : (
                                                    <Eye size={16} aria-hidden="true" />
                                                )}
                                            </button>}
                                        </div>
                                        {!passwordsMatch && (
                                            <div className="text-red-500 text-sm" role="alert">
                                                {t("passwordsDoNotMatch")}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {error && (
                                    <div className="text-red-500 text-sm" role="alert">
                                        {error}
                                    </div>
                                )}
                                <Button
                                    variant="default"
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                    aria-busy={loading}
                                >
                                    {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" aria-hidden="true" />}
                                    <span>{t("signUp")}</span>
                                </Button>
                            </div>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-row flex-wrap justify-center items-center gap-1 text-gray-600 dark:text-gray-300 text-sm text-center leading-none">
                        <p>
                            {t("alreadyHaveAccount")}
                        </p>
                        <Link href="/signin" className="underline underline-offset-4">
                            {t("signIn")}
                        </Link>
                    </CardFooter>
                </Card>
            </motion.div>

            <motion.footer
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
                className="flex flex-row flex-wrap justify-center items-center gap-1 font-normal text-gray-600 dark:text-gray-400 text-sm text-center leading-4"
                role="contentinfo"
            >
                <p>
                    {t("disclaimer")}
                </p>
                <Link href="/terms-of-service" className="underline underline-offset-4" aria-label="Terms of Service">
                    {t("termsOfService")}
                </Link>
                <p>
                    {t("and")}
                </p>
                <Link href="/privacy-policy" className="underline underline-offset-4" aria-label="Privacy Policy">
                    {t("privacyPolicy")}
                </Link>
            </motion.footer>
        </motion.section>
    );
} 