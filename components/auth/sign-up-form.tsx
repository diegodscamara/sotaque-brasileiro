import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeSlash, Pen, Student } from "@phosphor-icons/react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [isTypingPassword, setIsTypingPassword] = useState(false);
    const router = useRouter();
    const supabase = createClient();

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
                    role,
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

    const handleGoogleSignUp = async () => {
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
                },
            });

            if (error) {
                setError(error.message || "An unknown error occurred");
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
        <div className="flex flex-col items-center gap-4">
            <Tabs value={role} onValueChange={(value: "STUDENT" | "TEACHER") => setRole(value)} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="STUDENT" className="flex items-center gap-2">
                        <Student className="w-4 h-4" />
                        Student
                    </TabsTrigger>
                    <TabsTrigger value="TEACHER" className="flex items-center gap-2">
                        <Pen className="w-4 h-4" />
                        Teacher
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Sign up</CardTitle>
                    <CardDescription>
                        Enter your information to create an account
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <form onSubmit={handleSignUp}>
                        <div className="flex flex-col gap-6">
                            <div className="gap-2 grid">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="gap-2 grid">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="********"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setIsTypingPassword(true);
                                        }}
                                        required
                                    />
                                    <button type="button" className="top-1/2 right-2 absolute transform -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {isTypingPassword && (
                                    <div className={`text-sm ${strengthColor}`}>
                                        Password Strength: {passwordStrength}
                                    </div>
                                )}
                            </div>
                            {isPasswordStrong && (
                                <div className="gap-2 grid">
                                    <Label htmlFor="repeat-password">Repeat Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="repeat-password"
                                            type={showRepeatPassword ? "text" : "password"}
                                            placeholder="********"
                                            value={repeatPassword}
                                            onChange={(e) => setRepeatPassword(e.target.value)}
                                            required
                                        />
                                        <button type="button" className="top-1/2 right-2 absolute transform -translate-y-1/2" onClick={() => setShowRepeatPassword(!showRepeatPassword)}>
                                            {showRepeatPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {!passwordsMatch && (
                                        <div className="text-red-500 text-sm">
                                            Passwords do not match.
                                        </div>
                                    )}
                                </div>
                            )}
                            {error && (
                                <div className="text-red-500 text-sm">
                                    {error}
                                </div>
                            )}
                            <Button type="submit" className="w-full" disabled={loading || !isPasswordStrong || !passwordsMatch}>
                                {loading ? (
                                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                ) : null}
                                Create an account
                            </Button>
                        </div>
                    </form>

                    <div className="flex justify-center items-center gap-2 w-full">
                        <Separator className="w-1/3" />
                        <p className="font-medium text-base-content/50 text-xs">OR</p>
                        <Separator className="w-1/3" />
                    </div>

                    <Button onClick={handleGoogleSignUp} variant="outline" className="w-full" disabled={loading}>
                        <GoogleLogo className="mr-2 w-4 h-4" />
                        Sign up with Google
                    </Button>
                </CardContent>

                <CardFooter className="flex flex-row justify-center items-center gap-1 text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/signin" className="underline underline-offset-4">
                        Sign in
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
