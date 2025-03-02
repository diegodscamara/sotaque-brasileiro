"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CheckCircle } from "@phosphor-icons/react";

// UI Components
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Utils and API
import { createClient } from "@/libs/supabase/client";
import { getStudent } from "@/app/actions/students";
import { scheduleOnboardingClass } from "@/app/actions/classes";
import { OnboardingFormData } from "../types";

/**
 * Success page after Stripe checkout
 * Handles scheduling the class and updating student status
 */
export default function OnboardingSuccess() {
  const t = useTranslations("student.onboarding.success");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/signin");
          return;
        }

        // Get the session ID from URL params
        const sessionId = searchParams.get("session_id");
        if (!sessionId) {
          throw new Error("No session ID found");
        }

        // Get student data
        const studentData = await getStudent(user.id);
        if (!studentData) {
          throw new Error("Student not found");
        }

        // Get stored form data from localStorage
        const storedFormData = localStorage.getItem("onboardingFormData");
        if (!storedFormData) {
          throw new Error("No stored form data found");
        }

        // Parse the stored form data and convert date strings to Date objects
        const parsedData = JSON.parse(storedFormData);
        const formData: OnboardingFormData = {
          ...parsedData,
          classStartDateTime: parsedData.classStartDateTime ? new Date(parsedData.classStartDateTime) : undefined,
          classEndDateTime: parsedData.classEndDateTime ? new Date(parsedData.classEndDateTime) : undefined,
          pendingClass: parsedData.pendingClass ? {
            ...parsedData.pendingClass,
            startDateTime: new Date(parsedData.pendingClass.startDateTime),
            endDateTime: new Date(parsedData.pendingClass.endDateTime)
          } : undefined
        };
        
        if (!formData.pendingClass) {
          throw new Error("No pending class found");
        }

        if (!formData.pendingClass.teacherId) {
          throw new Error("No teacher selected for the class");
        }

        // Schedule the class now that payment is confirmed
        const { teacherId, studentId, startDateTime, endDateTime, duration, notes } = formData.pendingClass;
        await scheduleOnboardingClass({
          teacherId,
          studentId,
          startDateTime,
          endDateTime,
          duration,
          notes,
          status: "SCHEDULED"
        });

        // Clear stored form data
        localStorage.removeItem("onboardingFormData");

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } catch (error) {
        console.error("Error processing success:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    handleSuccess();
  }, [router, searchParams]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col justify-center items-center px-4 min-h-[60vh]"
    >
      {loading ? (
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
          <h1 className="mt-4 font-semibold text-gray-900 dark:text-gray-100 text-2xl">
            {t("processing")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("pleaseWait")}
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center">
          <div className="bg-red-100 mb-4 p-4 rounded-lg text-red-800">
            <p>{error}</p>
          </div>
          <Button onClick={() => router.push("/dashboard")}>
            {t("goToDashboard")}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="w-16 h-16 text-green-500" weight="fill" />
          <h1 className="mt-4 font-semibold text-gray-900 dark:text-gray-100 text-2xl">
            {t("success")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("redirecting")}
          </p>
        </div>
      )}
    </motion.div>
  );
} 