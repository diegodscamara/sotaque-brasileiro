"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/libs/supabase/client";
import { fetchClasses, cancelPendingClass } from "@/app/actions/classes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Warning } from "@phosphor-icons/react";
import { Spinner } from "@phosphor-icons/react/dist/ssr";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Page displayed when a checkout is cancelled
 * Handles cleanup of pending classes
 */
export default function CancelledPage() {
  const t = useTranslations("student.onboarding");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingClass, setPendingClass] = useState<any | null>(null);

  // Clean up pending class on page load
  useEffect(() => {
    const cleanupPendingClass = async () => {
      try {
        setIsLoading(true);
        
        // Get the current user
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError("User not authenticated");
          setIsLoading(false);
          return;
        }
        
        // Get the student's pending classes
        const pendingClasses = await fetchClasses({
          status: "PENDING"
        });
        
        if (pendingClasses && pendingClasses.data && pendingClasses.data.length > 0) {
          const existingPendingClass = pendingClasses.data[0];
          console.log(`Found pending class to cancel: ${existingPendingClass.id}`);
          
          // Store the pending class for display
          setPendingClass(existingPendingClass);
          
          // Cancel the pending class
          await cancelPendingClass(existingPendingClass.id);
          console.log(`Cancelled pending class: ${existingPendingClass.id}`);
        } else {
          console.log("No pending classes found to cancel");
        }
      } catch (err) {
        console.error("Error cleaning up pending class:", err);
        setError("Failed to clean up pending class");
      } finally {
        setIsLoading(false);
      }
    };
    
    cleanupPendingClass();
  }, []);
  
  // Handle retry checkout
  const handleRetryCheckout = () => {
    // Navigate back to step 3
    router.push("/student/onboarding?step=3");
  };
  
  // Handle go back to teacher selection
  const handleGoBackToTeacherSelection = () => {
    // Navigate back to step 2
    router.push("/student/onboarding?step=2");
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto px-4 py-16 md:py-24 max-w-4xl container"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-bold text-2xl">
            {t("checkout.cancelled.title")}
          </CardTitle>
          <CardDescription>
            {t("checkout.cancelled.description")}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner className="w-8 h-8 text-gray-500 animate-spin" />
              <span className="ml-2 text-gray-500">{t("checkout.cancelled.loading")}</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <Warning className="w-4 h-4" />
              <AlertTitle>{t("errors.general")}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <p>{t("checkout.cancelled.message")}</p>
              
              {pendingClass && (
                <Alert>
                  <AlertTitle>{t("checkout.cancelled.pendingClassCancelled")}</AlertTitle>
                  <AlertDescription>
                    {t("checkout.cancelled.pendingClassCancelledDescription")}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex sm:flex-row flex-col justify-end gap-4">
          <Button 
            variant="outline" 
            onClick={handleGoBackToTeacherSelection}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            {t("checkout.cancelled.goBackToTeacherSelection")}
          </Button>
          
          <Button 
            onClick={handleRetryCheckout}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            <Spinner className="mr-2 w-4 h-4" />
            {t("checkout.cancelled.retryCheckout")}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 