"use client";

import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import Image from "next/image";
import Link from "next/link";
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

export default function ForgotPassword() {
  const router = useRouter();
  const supabase = createClient();
  const tShared = useTranslations("shared");
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
            router.push(studentData?.hasAccess ? "/dashboard" : "/#pricing");
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
      >
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
        <ForgotPasswordForm />
      </motion.div>
    </motion.section>
  );
} 