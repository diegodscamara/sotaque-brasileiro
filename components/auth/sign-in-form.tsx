import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import React from "react";
import { createClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";
import useStudentApi from "@/hooks/useStudentApi";
import useTeacherApi from "@/hooks/useTeacherApi";

export default function SignInForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();
    const { getStudent } = useStudentApi();
    const { getTeacher } = useTeacherApi();

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
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Fetch user metadata to check role and access
            const { data: { user } } = await supabase.auth.getUser();
            const studentData = await getStudent(user.id);

            if (studentData) {
                if (studentData.has_access) {
                    router.push("/dashboard");
                } else {
                    router.push("/pricing");
                }
            } else {
                // If not a student, check if it's a teacher
                const teacherData = await getTeacher(user.id);

                if (teacherData) {
                    router.push("/dashboard");
                } else {
                    setError("User not found.");
                }
            }
        } catch (error) {
            setError(error.message);
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
            <CardContent>
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
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password">Password</Label>
                                <Link className="text-sm underline underline-offset-4" href="/forgot-password">Forgot password?</Link>
                            </div>
                            <div className="gap-2 grid">
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                {error && (
                                    <div className="text-red-500 text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                            ) : null}
                            Sign in
                        </Button>
                    </div>
                </form>
            </CardContent>

            <CardFooter className="flex flex-row justify-center items-center gap-1 text-center text-sm">
                <p className="text-sm">Don&apos;t have an account? </p>
                <Link className="underline underline-offset-4" href="/signup">Sign up</Link>
            </CardFooter>
        </Card>
    )
}