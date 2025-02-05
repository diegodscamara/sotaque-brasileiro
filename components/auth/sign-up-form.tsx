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

export default function SignUpForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
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
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: role,
                    },
                },
            });

            if (error || !data.user) {
                throw new Error((error?.message || "No user data returned"));
            }

            const { data: userData, error: userError } = await supabase.from("User").insert({
                id: data.user.id,
                email: data.user.email,
                firstName: "John",
                lastName: "Doe",
                role: role,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            if (userError) throw userError;

            if (userData && role === "STUDENT") {
                const { data: studentData, error: studentError } = await supabase.from("Student").insert({
                    id: data.user.id,
                    userId: data.user.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                if (studentError) throw studentError;

                if (studentData) {
                    router.push("/dashboard");
                } else {
                    router.push("/pricing");
                }
            } else {
                const { data: teacherData, error: teacherError } = await supabase.from("Teacher").insert({
                    id: data.user.id,
                    userId: data.user.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                if (teacherData) {
                    router.push("/dashboard");
                }

                if (teacherError) throw teacherError;
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
                <CardContent>
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
