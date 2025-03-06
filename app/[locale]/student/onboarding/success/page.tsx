"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CheckCircle } from "@phosphor-icons/react";

// UI Components
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Confetti } from "@/components/ui/confetti";

// Utils and API
import { createClient } from "@/libs/supabase/client";
import { getStudent } from "@/app/actions/students";
import { editClass, fetchClasses } from "@/app/actions/classes";

/**
 * Success page after Stripe checkout
 * Handles scheduling the class and updating student status
 */
export default function OnboardingSuccess() {
  const t = useTranslations("student.onboarding.success");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classScheduled, setClassScheduled] = useState(false);

  // Prevent automatic redirection - let the user click the button instead
  const [canNavigate, setCanNavigate] = useState(false);

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/signin");
          return;
        }

        // Get student data
        const studentData = await getStudent(user.id);
        if (!studentData) {
          throw new Error("Student data not found");
        }

        // Find pending class for this student
        try {
          const pendingClasses = await fetchClasses({
            studentId: studentData.id,
            status: "PENDING"
          });

          if (pendingClasses && pendingClasses.data && pendingClasses.data.length > 0) {
            // Use the most recently created pending class
            const pendingClass = pendingClasses.data[0];

            try {
              // Update the class status to SCHEDULED
              await editClass(pendingClass.id, {
                id: pendingClass.id,
                teacherId: pendingClass.teacherId,
                studentId: pendingClass.studentId,
                createdAt: pendingClass.createdAt,
                updatedAt: new Date(),
                startDateTime: pendingClass.startDateTime,
                endDateTime: pendingClass.endDateTime,
                duration: pendingClass.duration,
                notes: pendingClass.notes || "",
                feedback: undefined,
                rating: undefined,
                recurringGroupId: undefined,
                status: 'SCHEDULED'
              });

              setClassScheduled(true);
            } catch (updateError) {
              console.error("Error updating pending class status:", updateError);
              setError(`Note: Your class was found but could not be scheduled automatically. Please contact support or try scheduling a class from your dashboard. Error: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`);
            }
          } else {
            console.warn("No pending classes found for this student");
            setError("Note: No pending class was found. Please schedule a class from your dashboard.");
          }
        } catch (fetchError) {
          console.error("Error fetching pending classes:", fetchError);
          setError(`Note: There was an error finding your pending class. Please contact support or try scheduling a class from your dashboard. Error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error in handleSuccess:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
        setLoading(false);
      }
    };

    handleSuccess();
  }, [router, t]);

  useEffect(() => {
    // Allow navigation after 3 seconds to ensure the user sees the success message
    if (!loading && !error) {
      const timer = setTimeout(() => {
        setCanNavigate(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [loading, error]);

  // Prevent automatic redirection - let the user click the button instead
  const handleGoToDashboard = () => {
    if (canNavigate) {
      router.push("/dashboard");
    }
  };

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
          <Button onClick={handleGoToDashboard}>
            {t("goToDashboard")}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center max-w-md text-center">
          <Confetti />
          <div className="bg-green-100 mb-6 p-4 rounded-full">
            <CheckCircle size={48} weight="fill" className="text-green-600" />
          </div>
          <h1 className="mb-4 font-bold text-gray-900 dark:text-gray-100 text-3xl">
            {t("title")}
          </h1>
          <p className="mb-8 text-gray-600 dark:text-gray-400">
            {t("description")}
          </p>
          {classScheduled && (
            <div className="bg-blue-50 mb-6 p-4 rounded-lg text-blue-800">
              <p className="font-medium">{t("classScheduled")}</p>
              <p className="text-sm">{t("checkDashboard")}</p>
            </div>
          )}
          <Button
            onClick={handleGoToDashboard}
            className="w-full md:w-auto"
            disabled={!canNavigate}
          >
            {canNavigate ? t("goToDashboard") : t("enjoyingConfetti")}
          </Button>
        </div>
      )}
    </motion.div>
  );
} 