"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CheckCircle } from "@phosphor-icons/react";

// UI Components
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Confetti } from "@/components/ui/confetti";

// Utils and API
import { createClient } from "@/libs/supabase/client";
import { getStudent, editStudent } from "@/app/actions/students";
import { scheduleOnboardingClass, isClassAlreadyScheduled } from "@/app/actions/classes";
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

        // Get the session ID from URL params
        const sessionId = searchParams.get("session_id");
        if (!sessionId) {
          console.warn("No session ID found in URL, checking if user has access");
          // Even without session ID, check if the user already has access
          const studentData = await getStudent(user.id);
          if (studentData?.hasAccess) {
            setLoading(false);
            return;
          } else {
            throw new Error("No session ID found and user doesn't have access");
          }
        }

        // Call our endpoint to update the student record after checkout
        try {
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
          }
        } catch (updateError) {
          console.error("Error updating student record:", updateError);
          // Continue execution - the webhook might have succeeded
        }

        // Wait a moment to allow webhook processing to complete if it hasn't already
        await new Promise(resolve => setTimeout(resolve, 3000));

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
          
          // Wait a bit more and fetch the student data again
          await new Promise(resolve => setTimeout(resolve, 2000));
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
        
        // Only schedule the class if we have the necessary data and it hasn't been scheduled already
        if (formData?.pendingClass && studentData) {
          if (!formData.pendingClass.teacherId) {
            console.warn("No teacher selected for the class");
          } else {
            try {
              // First, check if the class has already been scheduled by the webhook
              // Use the server action instead of direct DB query
              const classAlreadyScheduled = await isClassAlreadyScheduled(
                studentData.id,
                formData.pendingClass.teacherId,
                new Date(formData.pendingClass.startDateTime)
              );

              if (classAlreadyScheduled) {
                console.log("Class already scheduled by webhook, skipping scheduling");
                setClassScheduled(true);
              } else {
                console.log("Class not found, attempting to schedule with data:", {
                  teacherId: formData.pendingClass.teacherId,
                  studentId: studentData.id,
                  startDateTime: formData.pendingClass.startDateTime,
                  endDateTime: formData.pendingClass.endDateTime,
                  duration: formData.pendingClass.duration,
                  notes: formData.pendingClass.notes || ""
                });
                
                // Ensure studentId is set correctly - use the actual student ID from the database
                const classData = {
                  teacherId: formData.pendingClass.teacherId,
                  studentId: studentData.id, // Always use the actual student ID from the database
                  startDateTime: new Date(formData.pendingClass.startDateTime),
                  endDateTime: new Date(formData.pendingClass.endDateTime),
                  duration: formData.pendingClass.duration || 30,
                  notes: formData.pendingClass.notes || "",
                  status: "SCHEDULED" as const
                };
                
                // Add additional validation before scheduling
                if (!classData.teacherId) {
                  throw new Error("Teacher ID is missing");
                }
                
                if (!classData.studentId) {
                  throw new Error("Student ID is missing");
                }
                
                if (!classData.startDateTime || !classData.endDateTime) {
                  throw new Error("Class date/time information is missing");
                }
                
                // Ensure dates are valid Date objects
                if (!(classData.startDateTime instanceof Date) || isNaN(classData.startDateTime.getTime())) {
                  console.error("Invalid start date:", formData.pendingClass.startDateTime);
                  classData.startDateTime = new Date(formData.pendingClass.startDateTime);
                }
                
                if (!(classData.endDateTime instanceof Date) || isNaN(classData.endDateTime.getTime())) {
                  console.error("Invalid end date:", formData.pendingClass.endDateTime);
                  classData.endDateTime = new Date(formData.pendingClass.endDateTime);
                }
                
                console.log("Final class data for scheduling:", JSON.stringify(classData, (key, value) => {
                  if (value instanceof Date) {
                    return value.toISOString();
                  }
                  return value;
                }, 2));
                
                // Schedule the class now that payment is confirmed
                const scheduledClass = await scheduleOnboardingClass(classData);
                
                console.log("Class scheduled successfully:", scheduledClass);
                setClassScheduled(true);
              }
            } catch (classError) {
              console.error("Error scheduling class:", classError);
              // Log more details about the error
              if (classError instanceof Error) {
                console.error("Error message:", classError.message);
                console.error("Error stack:", classError.stack);
              }
              
              // Try to get more information about the student
              try {
                const detailedStudent = await getStudent(user.id);
                console.log("Current student data:", detailedStudent);
              } catch (studentError) {
                console.error("Error fetching student details:", studentError);
              }
              
              // Continue with the process even if class scheduling fails
              // We don't want to block the user from completing onboarding
              setError(`Note: Your class could not be scheduled automatically. Please contact support or try scheduling a class from your dashboard. Error: ${classError instanceof Error ? classError.message : 'Unknown error'}`);
            }
          }
        } else {
          console.warn("No pending class data found in localStorage or student data is missing, trying to get class data from Stripe session metadata");
          
          // Try to get class data from Stripe session metadata
          try {
            if (sessionId && studentData) {
              console.log("Fetching session data from API for session ID:", sessionId);
              const sessionResponse = await fetch(`/api/stripe/get-session?sessionId=${sessionId}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              });
              
              if (sessionResponse.ok) {
                const sessionData = await sessionResponse.json();
                console.log("Retrieved session data:", sessionData);
                
                if (sessionData.metadata?.pendingClass) {
                  try {
                    const pendingClassData = JSON.parse(sessionData.metadata.pendingClass);
                    console.log("Found pending class in session metadata:", pendingClassData);
                    
                    if (!pendingClassData.teacherId) {
                      console.warn("No teacher ID in pending class data from session metadata");
                      return;
                    }
                    
                    // First, check if the class has already been scheduled by the webhook
                    // Use the server action instead of direct DB query
                    const classAlreadyScheduled = await isClassAlreadyScheduled(
                      studentData.id,
                      pendingClassData.teacherId,
                      new Date(pendingClassData.startDateTime)
                    );

                    if (classAlreadyScheduled) {
                      console.log("Class already scheduled by webhook, skipping scheduling");
                      setClassScheduled(true);
                    } else {
                      console.log("Class not found, attempting to schedule from session metadata");
                      
                      // Try to schedule the class from metadata
                      const classData = {
                        teacherId: pendingClassData.teacherId,
                        studentId: studentData.id,
                        startDateTime: new Date(pendingClassData.startDateTime),
                        endDateTime: new Date(pendingClassData.endDateTime),
                        duration: pendingClassData.duration || 30,
                        notes: pendingClassData.notes || "",
                        status: "SCHEDULED" as const
                      };
                      
                      // Validate the class data
                      if (!classData.teacherId || !classData.studentId) {
                        throw new Error("Missing required class data (teacher or student ID)");
                      }
                      
                      if (!(classData.startDateTime instanceof Date) || isNaN(classData.startDateTime.getTime())) {
                        console.error("Invalid start date from metadata:", pendingClassData.startDateTime);
                        classData.startDateTime = new Date(pendingClassData.startDateTime);
                      }
                      
                      if (!(classData.endDateTime instanceof Date) || isNaN(classData.endDateTime.getTime())) {
                        console.error("Invalid end date from metadata:", pendingClassData.endDateTime);
                        classData.endDateTime = new Date(pendingClassData.endDateTime);
                      }
                      
                      console.log("Final class data from metadata:", JSON.stringify(classData, (key, value) => {
                        if (value instanceof Date) {
                          return value.toISOString();
                        }
                        return value;
                      }, 2));
                      
                      const scheduledClass = await scheduleOnboardingClass(classData);
                      console.log("Class scheduled from session metadata:", scheduledClass);
                      setClassScheduled(true);
                    }
                  } catch (parseError) {
                    console.error("Error parsing or scheduling class from session metadata:", parseError);
                    if (parseError instanceof Error) {
                      console.error("Error message:", parseError.message);
                      console.error("Error stack:", parseError.stack);
                    }
                  }
                } else {
                  console.warn("No pending class data found in session metadata");
                }
              } else {
                console.error("Failed to retrieve session data:", await sessionResponse.text());
              }
            } else {
              console.warn("No session ID or student data available to retrieve class data");
            }
          } catch (sessionError) {
            console.error("Error retrieving or processing session data:", sessionError);
            if (sessionError instanceof Error) {
              console.error("Error message:", sessionError.message);
              console.error("Error stack:", sessionError.stack);
            }
          }
        }

        // Update student record to mark onboarding as completed
        await editStudent(user.id, {
          ...studentWithUser,
          hasCompletedOnboarding: true,
          hasAccess: true
        });

        // Always clear stored form data to prevent issues with future onboarding sessions
        localStorage.removeItem("onboardingFormData");
      } catch (error) {
        console.error("Error processing success:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    handleSuccess();
  }, [router, searchParams] as const);

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