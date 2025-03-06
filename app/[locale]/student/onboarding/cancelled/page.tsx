"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { createClient } from "@/libs/supabase/client";
import { getStudent } from "@/app/actions/students";
import { fetchClasses, cancelPendingClass } from "@/app/actions/classes";
import { Loader2, AlertCircle } from "lucide-react";

/**
 * OnboardingCancelled component handles the case when a student cancels or fails checkout
 * It cleans up any pending classes and provides options to retry or go back
 * @returns {React.JSX.Element} The onboarding cancelled component
 */
export default function OnboardingCancelled() {
  const t = useTranslations("student.onboarding.cancelled");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cleanupComplete, setCleanupComplete] = useState(false);

  useEffect(() => {
    const handleCancellation = async () => {
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

        console.log("Student data retrieved:", studentData);
        
        // Find and clean up any pending classes
        try {
          console.log("Fetching pending classes for student:", studentData.id);
          const pendingClasses = await fetchClasses({
            studentId: studentData.id,
            status: "PENDING"
          });
          
          console.log("Found pending classes:", pendingClasses);
          
          if (pendingClasses && pendingClasses.data && pendingClasses.data.length > 0) {
            console.log(`Found ${pendingClasses.data.length} pending classes to clean up`);
            
            for (const pendingClass of pendingClasses.data) {
              await cancelPendingClass(pendingClass.id);
              console.log(`Cancelled pending class with ID: ${pendingClass.id}`);
            }
            
            setCleanupComplete(true);
          } else {
            console.log("No pending classes found to clean up");
            setCleanupComplete(true);
          }
        } catch (fetchError) {
          console.error("Error fetching or cancelling pending classes:", fetchError);
          setError(`There was an error cleaning up your pending class. Error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error in handleCancellation:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
        setLoading(false);
      }
    };

    handleCancellation();
  }, [router, t]);

  const handleRetry = () => {
    // Go back to step 3 (pricing)
    router.push("/student/onboarding?step=3");
  };

  const handleGoBack = () => {
    // Go back to step 2 (teacher selection)
    router.push("/student/onboarding?step=2");
  };

  return (
    <div className="flex flex-col justify-center items-center px-4 py-8 min-h-[60vh]">
      <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-lg w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="mb-4 w-16 h-16 text-red-500" />
          
          <h1 className="mb-2 font-bold text-2xl">
            {t("title")}
          </h1>
          
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            {t("description")}
          </p>
          
          {loading ? (
            <div className="flex justify-center items-center space-x-2">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span>{t("cleaningUp")}</span>
            </div>
          ) : error ? (
            <div className="mb-4 text-red-500">
              {error}
            </div>
          ) : (
            <div className="mb-4 text-green-500">
              {cleanupComplete ? t("cleanupComplete") : ""}
            </div>
          )}
          
          <div className="flex sm:flex-row flex-col gap-4 mt-6 w-full">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={handleGoBack}
              disabled={loading}
            >
              {t("goBack")}
            </Button>
            
            <Button 
              className="flex-1" 
              onClick={handleRetry}
              disabled={loading}
            >
              {t("retry")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 