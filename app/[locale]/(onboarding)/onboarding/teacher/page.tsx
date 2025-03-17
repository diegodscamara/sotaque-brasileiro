import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/app/actions/auth";
import { validateEmail } from "@/libs/utils/validation";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/user-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Icons } from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PasswordInput from "@/components/ui/password-input";

export default function TeacherOnboardingPage() {
  const t = useTranslations("onboarding.teacher");
  const router = useRouter();
  const { toast } = useToast();
  const { isLoading } = useUser();
  const form = useForm({
    resolver: zodResolver(z.object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z.string().email("Invalid email"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
      terms: z.boolean().refine((value) => value, {
        message: "You must agree to the terms and conditions",
      }),
    })),
  });

  const onSubmit = async (data) => {
    try {
      await signUp(data);
      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative flex-col justify-center items-center grid lg:grid-cols-2 lg:px-0 lg:max-w-none h-screen container">
      <div className="hidden relative lg:flex flex-col bg-muted p-10 dark:border-r h-full text-white">
        {/* ... existing code ... */}
      </div>
      <div className="flex items-center p-4 lg:p-8 h-full">
        <div className="flex flex-col justify-center space-y-6 mx-auto w-full sm:w-[350px]">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">{t("title")}</CardTitle>
              <CardDescription className="text-center">
                {t("description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.firstName.label")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("form.firstName.placeholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.lastName.label")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("form.lastName.placeholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.email.label")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("form.email.placeholder")} type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <PasswordInput
                            value={field.value}
                            onChange={field.onChange}
                            error={form.formState.errors.password?.message}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.confirmPassword.label")}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={t("form.confirmPassword.placeholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {t("form.terms.label")}{" "}
                            <Link
                              href={t("form.terms.link")}
                              className="text-primary hover:underline"
                            >
                              {t("form.terms.linkText")}
                            </Link>
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Icons.spinner className="mr-2 w-4 h-4 animate-spin" />
                    )}
                    {t("form.submit")}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <p className="text-muted-foreground text-sm text-center">
                {t("form.alreadyHaveAccount")}{" "}
                <Link
                  href="/signin"
                  className="text-primary hover:underline"
                >
                  {t("form.signIn")}
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 