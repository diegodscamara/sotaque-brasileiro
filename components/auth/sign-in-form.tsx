import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeSlash } from "@phosphor-icons/react";
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

export default function SignInForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const supabase = createClient();

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
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Sign in</CardTitle>
                <CardDescription>
                    Enter your information to sign in
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <form onSubmit={handleSignIn}>
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
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" className="top-1/2 right-2 absolute transform -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {error && (
                                <div className="text-red-500 text-sm">
                                    {error}
                                </div>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                            ) : null}
                            Sign In
                        </Button>
                    </div>
                </form>

                <div className="flex justify-center items-center gap-2 w-full">
                    <Separator className="w-1/3" />
                    <p className="font-medium text-base-content/50 text-xs">OR</p>
                    <Separator className="w-1/3" />
                </div>

                <Button onClick={handleGoogleSignIn} variant="outline" className="w-full" disabled={loading}>
                    <GoogleLogo className="mr-2 w-4 h-4" />
                    Sign in with Google
                </Button>
            </CardContent>

            <CardFooter className="flex flex-row justify-center items-center gap-1 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline underline-offset-4">
                    Sign up
                </Link>
            </CardFooter>
        </Card>
    )
}