"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import React, { JSX } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/libs/supabase/client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { validateEmail } from "@/libs/utils/validation";

/**
 * ForgotPasswordForm component for password reset requests
 * @returns {JSX.Element} The forgot password form
 */
export default function ForgotPasswordForm(): JSX.Element {
    const t = useTranslations("auth.forgot-password");
    const tErrors = useTranslations("errors");

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!validateEmail(email.trim())) {
            setError(tErrors("invalidEmail"));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
            });

            if (error) throw error;
            setSuccess(true);
        } catch (error) {
            setError(error instanceof Error ? error.message : tErrors("unknownError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="rounded-lg w-full max-w-md">
            <CardHeader>
                <CardTitle className="font-semibold text-lg text-center leading-8">
                    {t("title")}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-sm text-center leading-none">
                    {t("description")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {success ? (
                    <p className="text-green-600 dark:text-green-400 text-center">
                        {t("checkEmail")}
                    </p>
                ) : (
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
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError(null);
                                }}
                                placeholder={t("emailPlaceholder")}
                                required
                                aria-invalid={error ? "true" : undefined}
                                aria-errormessage={error ? "email-error" : undefined}
                                className="bg-transparent dark:bg-transparent border-gray-300 dark:border-gray-600 placeholder:font-normal text-gray-800 dark:text-gray-200 dark:placeholder:text-gray-400 placeholder:text-gray-500 placeholder:text-sm placeholder:leading-none"
                            />
                            {error && (
                                <div id="email-error" role="alert" className="text-red-500 text-sm">
                                    {error}
                                </div>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                            aria-busy={loading}
                        >
                            {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" aria-hidden="true" />}
                            {t("resetPassword")}
                        </Button>
                    </form>
                )}
            </CardContent>
            <CardFooter className="flex flex-row flex-wrap justify-center items-center">
                <Link
                    href="/signin"
                    className="text-gray-600 dark:text-gray-400 text-sm hover:underline"
                >
                    {t("backToSignIn")}
                </Link>
            </CardFooter>
        </Card>
    );
} 