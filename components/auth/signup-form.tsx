"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import React, { JSX } from "react";
import { validateEmail, validatePassword } from "@/libs/utils/validation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import PasswordInput from "../ui/password-input";

interface SignUpFormProps {
    role: "STUDENT" | "TEACHER";
    // eslint-disable-next-line no-unused-vars
    onSuccess: (redirectUrl: string) => void;
}

/**
 * SignUpForm component for user registration
 * @param {SignUpFormProps} props - Component props
 * @returns {JSX.Element} The signup form
 */
export default function SignUpForm({ role, onSuccess }: SignUpFormProps): JSX.Element {
    const t = useTranslations("auth.sign-up");
    const tErrors = useTranslations("errors");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        repeatPassword: "",
        showRepeatPassword: false,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const passwordsMatch = formData.password === formData.repeatPassword;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | string): void => {
        const value = typeof e === 'string' ? e : e.target.value;
        const name = typeof e === 'string' ? 'password' : e.target.name;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const togglePasswordVisibility = (field: 'showRepeatPassword'): void => {
        setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!validateEmail(formData.email.trim())) {
            setError(tErrors("invalidEmail"));
            return;
        }

        if (!validatePassword(formData.password)) {
            setError(tErrors("invalidPassword"));
            return;
        }

        if (!passwordsMatch) {
            setError(t("passwordsDoNotMatch"));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email.trim(),
                    password: formData.password,
                    signIn: false,
                    role,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || tErrors("unknownError"));
            } else {
                onSuccess(data.redirectUrl || (role === "STUDENT" ? "/onboarding/student" : "/dashboard"));
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : tErrors("unknownError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="rounded-lg w-full max-w-md">
            <CardHeader className="items-center">
                <CardTitle className="font-semibold text-lg text-center leading-8">
                    {t("title")}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-sm text-center leading-none">
                    {role === "TEACHER" ? t("teacherSubtitle") : t("subtitle")}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="gap-2 grid">
                        <Label
                            htmlFor="email"
                            className="text-gray-800 dark:text-gray-200 text-sm leading-none"
                        >
                            {t("email")}
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder={t("emailPlaceholder")}
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            aria-invalid={error?.includes("email") ? "true" : undefined}
                            aria-errormessage={error?.includes("email") ? "email-error" : undefined}
                        />
                    </div>

                    <div className="gap-2 grid">
                        <div className="relative">
                            <PasswordInput
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                error={error?.includes("password") ? error : undefined}
                            />
                        </div>
                    </div>

                    <div className="gap-2 grid">
                        <Label
                            htmlFor="repeatPassword"
                            className="text-gray-800 dark:text-gray-200 text-sm leading-none"
                        >
                            {t("repeatPassword")}
                        </Label>
                        <div className="relative">
                            <Input
                                id="repeatPassword"
                                name="repeatPassword"
                                type={formData.showRepeatPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder={t("passwordPlaceholder")}
                                value={formData.repeatPassword}
                                onChange={handleInputChange}
                                required
                                aria-invalid={formData.repeatPassword && !passwordsMatch ? "true" : undefined}
                                aria-errormessage={formData.repeatPassword && !passwordsMatch ? "repeat-password-error" : undefined}
                            />
                            {formData.repeatPassword && (
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('showRepeatPassword')}
                                    className="top-1/2 right-2 absolute -translate-y-1/2"
                                    aria-label={formData.showRepeatPassword ? t("hidePassword") : t("showPassword")}
                                >
                                    {formData.showRepeatPassword ? (
                                        <EyeSlash size={16} aria-hidden="true" />
                                    ) : (
                                        <Eye size={16} aria-hidden="true" />
                                    )}
                                </button>
                            )}
                        </div>
                        {formData.repeatPassword && !passwordsMatch && (
                            <div id="repeat-password-error" role="alert" className="text-red-500 text-sm">
                                {t("passwordsDoNotMatch")}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div role="alert" className="text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                        aria-busy={loading}
                    >
                        {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" aria-hidden="true" />}
                        {t("signUp")}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex flex-row flex-wrap justify-center items-center gap-1 text-gray-600 dark:text-gray-300 text-sm text-center leading-none">
                <p>{t("alreadyHaveAccount")}</p>
                <Link href="/signin" className="underline underline-offset-4">
                    {t("signIn")}
                </Link>
            </CardFooter>
        </Card>
    );
} 