import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast"

export default function SignInForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast()
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

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                    emailRedirectTo: window.location.origin + "/api/auth/callback",
                },
            })
            toast({
                title: "Check your emails!",
                variant: "default",
            });

            if (error) {
                console.error("Email sign-in error:", error);
                toast({
                    title: "Failed to sign in",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Email sign-in error:", error);
            toast({
                title: "Failed to sign in",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: window.location.origin + "/api/auth/callback",
                    queryParams: {
                        access_type: "offline",
                        prompt: "consent",
                    },
                },
            });

            if (error) {
                console.error("Google sign-in error:", error);
                toast({
                    title: "Failed to sign in",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Google sign-in error:", error);
            toast({
                title: "Failed to sign in",
                variant: "destructive",
            });
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
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                            ) : null}
                            Sign in with email
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
        </Card>
    )
}