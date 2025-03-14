"use client";

import Image from "next/image";
import Link from "next/link";
import SignUpForm from "@/components/auth/signup-form";
import { createClient } from "@/libs/supabase/client";
import logo from "@/app/icon.png";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { getStudent } from "@/app/actions/students";
import { getUser } from "@/app/actions/users";
import { useTranslations } from "next-intl";

export default function SignUp() {
    const router = useRouter();
    const supabase = createClient();
    const tShared = useTranslations("shared");
    const t = useTranslations("auth.sign-up");
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true });

    // Check user authentication status and redirect if needed
    useEffect(() => {
        const checkUser = async (): Promise<void> => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const role = user.user_metadata?.role;
                const userData = await getUser(user.id);

                if (!userData) return;

                switch (role) {
                    case "ADMIN":
                        router.push("/admin");
                        break;
                    case "TEACHER":
                        router.push("/dashboard");
                        break;
                    case "STUDENT": {
                        const studentData = await getStudent(user.id);
                        if (!studentData) return;
                        
                        if (studentData.hasCompletedOnboarding) {
                            router.push("/dashboard");
                        } else {
                            router.push("/onboarding/student");
                        }
                        break;
                    }
                }
            }
        };

        checkUser();
    }, [router, supabase.auth]);

    return (
        <motion.section
            ref={sectionRef}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative flex flex-col justify-center items-center gap-6 mx-auto px-4 py-20 md:py-24 lg:pb-16 max-w-7xl h-full container"
        >
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                aria-label="Logo"
                aria-roledescription="Logo"
            >
                {/* Logo */}
                <Link
                    className="flex items-center gap-2 shrink-0"
                    href="/"
                    title={`${tShared("appName")} homepage`}
                >
                    <Image
                        src={logo}
                        alt={`${tShared("appName")} logo`}
                        className="w-8"
                        placeholder="blur"
                        priority={true}
                        width={32}
                        height={32}
                    />
                    <span className="font-extrabold text-lg">{tShared("appName")}</span>
                </Link>
            </motion.header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            >
                <SignUpForm role="STUDENT" onSuccess={(url) => router.push(url)} />
            </motion.div>

            <motion.footer
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
                className="flex flex-row flex-wrap justify-center items-center gap-1 font-normal text-gray-600 dark:text-gray-400 text-sm text-center leading-4"
                aria-label="Disclaimer"
                aria-roledescription="Disclaimer"
            >
                <p>
                    {t("disclaimer")}
                </p>
                <Link href="/terms-of-service" className="underline underline-offset-4" aria-label="Terms of Service" aria-roledescription="Terms of Service">
                    {t("termsOfService")}
                </Link>
                <p>
                    {t("and")}
                </p>
                <Link href="/privacy-policy" className="underline underline-offset-4" aria-label="Privacy Policy" aria-roledescription="Privacy Policy">
                    {t("privacyPolicy")}
                </Link>
            </motion.footer>
        </motion.section>
    );
} 