import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pen, Student } from "@phosphor-icons/react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function SignUpForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [first_name, setFirst_name] = useState("");
    const [last_name, setLast_name] = useState("");
    const [role, setRole] = useState<"student" | "teacher">("student");
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
                        first_name,
                        last_name,
                    },
                },
            });

            if (error) throw error;

            // Redirect based on role
            if (role === "student") {
                // Check if the student has access
                const { data: { user } } = await supabase.auth.getUser();
                const studentData = await getStudent(user.id);

                if (studentData && studentData.has_access) {
                    router.push("/dashboard");
                } else {
                    router.push("/pricing");
                }
            } else {
                // If it's a teacher, redirect to dashboard
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Sign up error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
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
            </Tabs>

            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Sign up</CardTitle>
                    <CardDescription>
                        Enter your information to create an account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignUp} >
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-column items-center gap-6">
                                <div className="gap-2 grid">
                                    <Label htmlFor="first_name">First name</Label>
                                    <Input
                                        id="first_name"
                                        type="text"
                                        placeholder="John"
                                        value={first_name}
                                        onChange={(e) => setFirst_name(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="gap-2 grid">
                                    <Label htmlFor="last_name">Last name</Label>
                                    <Input
                                        id="last_name"
                                        type="text"
                                        placeholder="Doe"
                                        value={last_name}
                                        onChange={(e) => setLast_name(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
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
                                    placeholder="********"
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
                                Create an account
                            </Button>
                        </div>
                    </form>
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
