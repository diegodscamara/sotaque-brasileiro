import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pen, Student } from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import React from "react";
import { createClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"student" | "teacher">("student");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: role,
                    },
                },
            });

            if (error) throw error;
            router.push("/dashboard");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
            });

            if (error) throw error;
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Welcome to the community</CardTitle>
                <CardDescription>
                    Choose your role and sign up
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={role} onValueChange={(value: "student" | "teacher") => setRole(value)} className="w-full">
                    <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="student" className="flex items-center gap-2">
                            <Student className="w-4 h-4" />
                            Student
                        </TabsTrigger>
                        <TabsTrigger value="teacher" className="flex items-center gap-2">
                            <Pen className="w-4 h-4" />
                            Teacher
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="student">
                        <p className="my-4 text-center text-muted-foreground text-sm">
                            Sign up as a student to start learning Portuguese
                        </p>
                    </TabsContent>
                    <TabsContent value="teacher">
                        <p className="my-4 text-center text-muted-foreground text-sm">
                            Sign up as a teacher to start teaching Portuguese
                        </p>
                    </TabsContent>
                </Tabs>

                <form onSubmit={handleSignUp} >
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
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                            ) : null}
                            Sign up
                        </Button>
                    </div>
                </form>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="border-t w-full"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            or
                        </span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    ) : (
                        <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                    )}
                    Continue with Google
                </Button>

                <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/signin" className="underline underline-offset-4">
                        Sign in
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}