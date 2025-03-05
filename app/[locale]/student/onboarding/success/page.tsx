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
import { getStudent, editStudent } from "@/app/actions/students";
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

        // Call our endpoint to update the student record after checkout
        const updateResponse = await fetch("/api/stripe/update-student-after-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          console.error("Failed to update student record:", errorData);
          // Continue execution instead of throwing - the webhook might have succeeded
          // We'll check if the student record exists and has been updated
        }

        // Wait a moment to allow webhook processing to complete if it hasn't already
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get student data
        let studentData = await getStudent(user.id);
        if (!studentData) {
          throw new Error("Student not found");
        }

        // Check if the student record has been properly updated
        if (!studentData.hasAccess || !studentData.customerId) {
          console.warn("Student record may not be fully updated. Retrying update...");
          
          // Try the update one more time
          await fetch("/api/stripe/update-student-after-checkout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          });
          
          // Fetch the student data again
          const refreshedStudentData = await getStudent(user.id);
          if (refreshedStudentData) {
            console.log("Student data refreshed after retry");
            studentData = refreshedStudentData;
          }
        }

        // Create a proper Student object with the user property
        const studentWithUser = {
          ...studentData,
          // Convert null values to undefined to match the Student interface
          customerId: studentData.customerId || undefined,
          priceId: studentData.priceId || undefined,
          packageName: studentData.packageName || undefined,
          packageExpiration: studentData.packageExpiration || undefined,
          portugueseLevel: studentData.portugueseLevel || undefined,
          nativeLanguage: studentData.nativeLanguage || undefined,
          timeZone: studentData.timeZone || undefined,
          // Ensure arrays are properly handled
          learningGoals: Array.isArray(studentData.learningGoals) ? studentData.learningGoals : [],
          otherLanguages: Array.isArray(studentData.otherLanguages) ? studentData.otherLanguages : [],
          user: {
            id: user.id,
            email: user.email || "",
            createdAt: new Date(user.created_at || Date.now()),
            updatedAt: new Date(),
            role: "STUDENT" as const
          }
        };

        // Get stored form data from localStorage
        const storedFormData = localStorage.getItem("onboardingFormData");
        if (!storedFormData) {
          console.warn("No stored form data found, continuing with available data");
          // Continue with the process even if no localStorage data is found
          // The webhook might have already processed everything
        }

        let formData: OnboardingFormData | null = null;
        
        if (storedFormData) {
          try {
            // Parse the stored form data and convert date strings to Date objects
            const parsedData = JSON.parse(storedFormData);
            formData = {
              ...parsedData,
              classStartDateTime: parsedData.classStartDateTime ? new Date(parsedData.classStartDateTime) : undefined,
              classEndDateTime: parsedData.classEndDateTime ? new Date(parsedData.classEndDateTime) : undefined,
              pendingClass: parsedData.pendingClass ? {
                ...parsedData.pendingClass,
                startDateTime: new Date(parsedData.pendingClass.startDateTime),
                endDateTime: new Date(parsedData.pendingClass.endDateTime)
              } : undefined
            };
          } catch (parseError) {
            console.error("Error parsing stored form data:", parseError);
          }
        }
        
        // Only schedule the class if we have the necessary data
        if (formData?.pendingClass) {
          if (!formData.pendingClass.teacherId) {
            console.warn("No teacher selected for the class");
          } else {
            try {
              console.log("Attempting to schedule class with data:", {
                teacherId: formData.pendingClass.teacherId,
                studentId: formData.pendingClass.studentId,
                startDateTime: formData.pendingClass.startDateTime,
                endDateTime: formData.pendingClass.endDateTime,
                duration: formData.pendingClass.duration,
                notes: formData.pendingClass.notes || ""
              });
              
              // Schedule the class now that payment is confirmed
              const { teacherId, studentId, startDateTime, endDateTime, duration, notes } = formData.pendingClass;
              const scheduledClass = await scheduleOnboardingClass({
                teacherId,
                studentId,
                startDateTime,
                endDateTime,
                duration,
                notes: notes || "",
                status: "SCHEDULED"
              });
              
              console.log("Class scheduled successfully:", scheduledClass);
            } catch (classError) {
              console.error("Error scheduling class:", classError);
              // Continue with the process even if class scheduling fails
              // We don't want to block the user from completing onboarding
            }
          }
        } else {
          console.warn("No pending class data found, skipping class scheduling");
        }

        // Update student record to mark onboarding as completed
        await editStudent(user.id, {
          ...studentWithUser,
          hasCompletedOnboarding: true,
          hasAccess: true
        });

        // Always clear stored form data to prevent issues with future onboarding sessions
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