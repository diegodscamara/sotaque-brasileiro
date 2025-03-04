"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";

// Step Components
import Step1PersonalInfo from "./components/Step1PersonalInfo";
import Step2TeacherSelection from "./components/Step2TeacherSelection";
import Step3Pricing from "./components/Step3Pricing";
import Stepper from "./components/Stepper";

// Utils and API
import { createClient } from "@/libs/supabase/client";
import { getStudent } from "@/app/actions/students";
import { getUser, updateUser } from "@/app/actions/users";
import { editStudent } from "@/app/actions/students";
import { scheduleOnboardingClass } from "@/app/actions/classes";
import { validateEmail } from "@/libs/utils/validation";

// Types
import { OnboardingFormData } from "./types";
import { Student } from "@/types";

/**
 * StudentOnboarding component handles the student onboarding process with multiple steps
 * @returns {React.JSX.Element} The student onboarding component
 */
export default function StudentOnboarding(): React.JSX.Element {
  // Translations
  const t = useTranslations("student.onboarding");
  const tErrors = useTranslations("errors");
  const tFormActions = useTranslations("student.onboarding.step1.formActions");

  // Form state
  const [formData, setFormData] = useState<OnboardingFormData>({
    // Personal details
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    gender: "",
    timeZone: "",

    // Learning preferences
    portugueseLevel: "",
    nativeLanguage: "",
    learningGoals: [],
    otherLanguages: [],

    // Package details (will be set to "pending" if not available)
    customerId: "",
    priceId: "",
    packageName: "",
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Hooks
  const router = useRouter();
  const supabase = createClient();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true });

  // Refs to track initialization
  const hasSetCountry = useRef(false);
  const hasLoadedUserData = useRef(false);

  /**
   * Detects user's country from geolocation when component mounts
   */
  useEffect(() => {
    if (!hasSetCountry.current && !formData.country) {
      // Try to get user's country from geolocation
      const detectCountry = async () => {
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          if (data.country) {
            setFormData(prev => ({
              ...prev,
              country: data.country
            }));
            hasSetCountry.current = true;
          }
        } catch (error) {
          console.error("Error detecting country:", error);
        }
      };

      detectCountry();
    }
  }, [formData.country]);

  /**
   * Fetches user data and pre-fills the form
   */
  useEffect(() => {
    if (!hasLoadedUserData.current) {
      const fetchUserData = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            router.push("/signin");
            return;
          }

          // Check for saved onboarding data in localStorage first
          const savedFormData = localStorage.getItem("onboardingFormData");
          let parsedFormData: Partial<OnboardingFormData> = {};
          let shouldRestoreFromLocalStorage = false;

          if (savedFormData) {
            try {
              parsedFormData = JSON.parse(savedFormData);
              shouldRestoreFromLocalStorage = true;
              console.log("Restored form data from localStorage:", parsedFormData);
            } catch (parseError) {
              console.error("Error parsing saved form data:", parseError);
            }
          }

          // Get user and student data
          const userData = await getUser(user.id);
          const studentData = await getStudent(user.id);

          if (userData) {
            // Pre-fill form with existing user data, prioritizing localStorage data if available
            setFormData(prev => ({
              ...prev,
              firstName: shouldRestoreFromLocalStorage ? parsedFormData.firstName || "" : userData.firstName || "",
              lastName: shouldRestoreFromLocalStorage ? parsedFormData.lastName || "" : userData.lastName || "",
              email: shouldRestoreFromLocalStorage ? parsedFormData.email || "" : userData.email || "",
              country: shouldRestoreFromLocalStorage ? parsedFormData.country || "" : userData.country || prev.country,
              gender: shouldRestoreFromLocalStorage ? parsedFormData.gender || "" : userData.gender || "",
              timeZone: shouldRestoreFromLocalStorage ? parsedFormData.timeZone || "" : studentData?.timeZone || prev.timeZone,
              portugueseLevel: shouldRestoreFromLocalStorage ? parsedFormData.portugueseLevel || "" : studentData?.portugueseLevel || "",
              nativeLanguage: shouldRestoreFromLocalStorage ? parsedFormData.nativeLanguage || "" : studentData?.nativeLanguage || "",
              learningGoals: shouldRestoreFromLocalStorage ? parsedFormData.learningGoals || [] : studentData?.learningGoals || [],
              otherLanguages: shouldRestoreFromLocalStorage ? parsedFormData.otherLanguages || [] : studentData?.otherLanguages || [],
              customerId: studentData?.customerId || "",
              priceId: studentData?.priceId || "",
              packageName: studentData?.packageName || "",
              // Restore Step 2 data if available
              selectedTeacherId: shouldRestoreFromLocalStorage ? parsedFormData.selectedTeacherId : undefined,
              classNotes: shouldRestoreFromLocalStorage ? parsedFormData.classNotes : undefined,
              classDuration: shouldRestoreFromLocalStorage ? parsedFormData.classDuration : undefined,
            }));

            // Restore date/time objects if they exist in localStorage
            if (shouldRestoreFromLocalStorage) {
              if (parsedFormData.classStartDateTime) {
                setFormData(prev => ({
                  ...prev,
                  classStartDateTime: new Date(String(parsedFormData.classStartDateTime))
                }));
              }
              
              if (parsedFormData.classEndDateTime) {
                setFormData(prev => ({
                  ...prev,
                  classEndDateTime: new Date(String(parsedFormData.classEndDateTime))
                }));
              }

              // Restore pending class data if available
              if (parsedFormData.pendingClass) {
                const pendingClass = {
                  ...parsedFormData.pendingClass,
                  startDateTime: new Date(String(parsedFormData.pendingClass.startDateTime)),
                  endDateTime: new Date(String(parsedFormData.pendingClass.endDateTime))
                };
                
                setFormData(prev => ({
                  ...prev,
                  pendingClass
                }));
              }

              // Set completed steps based on available data
              const completedStepsArray = [];
              
              // Step 1 is completed if we have basic personal info
              if (parsedFormData.firstName && parsedFormData.lastName && parsedFormData.email) {
                completedStepsArray.push(1);
              }
              
              // Step 2 is completed if we have teacher and class details
              if (parsedFormData.pendingClass && parsedFormData.pendingClass.teacherId) {
                completedStepsArray.push(2);
              }
              
              setCompletedSteps(completedStepsArray);
              
              // Navigate to the appropriate step
              if (completedStepsArray.includes(2)) {
                // If step 2 is completed, go to step 3 (pricing)
                setCurrentStep(3);
              } else if (completedStepsArray.includes(1)) {
                // If only step 1 is completed, go to step 2
                setCurrentStep(2);
              }
            }
          }

          if (studentData) {
            // Set student data
            setStudentData(studentData as unknown as Student);

            // If onboarding is already completed and user has access, redirect to dashboard
            if (studentData.hasCompletedOnboarding && studentData.hasAccess) {
              router.push("/dashboard");
            }
          }

          hasLoadedUserData.current = true;
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    }
  }, [router, supabase.auth]);

  /**
   * Handles input change events for text inputs
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  /**
   * Handles select change events
   */
  const handleSelectChange = (name: string, value: string): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  /**
   * Handles date/time change events
   */
  const handleDateTimeChange = (name: string, value: Date): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  /**
   * Handles multi-select change events
   */
  const handleMultiSelectChange = (name: string, values: string[]): void => {
    setFormData(prev => ({ ...prev, [name]: values }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  /**
   * Validates form inputs for the current step
   */
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Validate personal details and learning preferences
      if (!formData.firstName) {
        newErrors.firstName = t("step1.forms.personalDetails.firstNameError");
      }

      if (!formData.lastName) {
        newErrors.lastName = t("step1.forms.personalDetails.lastNameError");
      }

      if (!formData.email || !validateEmail(formData.email)) {
        newErrors.email = tErrors("invalidEmail");
      }

      if (!formData.timeZone) {
        newErrors.timeZone = t("step1.forms.personalDetails.timezoneError");
      }

      if (!formData.country) {
        newErrors.country = t("step1.forms.personalDetails.countryError");
      }

      if (!formData.portugueseLevel) {
        newErrors.portugueseLevel = t("step1.forms.learningPreferences.portugueseLevelError");
      }

      if (!formData.nativeLanguage) {
        newErrors.nativeLanguage = t("step1.forms.learningPreferences.nativeLanguageError");
      }

      if (formData.learningGoals.length === 0) {
        newErrors.learningGoals = t("step1.forms.learningPreferences.learningGoalsError");
      }
    } else if (step === 2) {
      // Validate teacher selection and class scheduling
      if (!formData.selectedTeacherId) {
        newErrors.selectedTeacherId = t("step2.errors.teacherRequired");
      }

      if (!formData.classStartDateTime) {
        newErrors.classStartDateTime = t("step2.errors.dateTimeRequired");
      }
    }

    // Add validation for future steps here

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles navigation to the next step
   */
  const handleNextStep = async (): Promise<void> => {
    if (!validateStep(currentStep)) return;

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/signin");
        return;
      }

      // If this is the first step, save the personal data
      if (currentStep === 1) {
        try {
          // Update user data
          const userUpdateResult = await updateUser(user.id, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            country: formData.country,
            gender: formData.gender,
          });

          if (!userUpdateResult) {
            throw new Error(tErrors("failedToUpdateUser"));
          }

          // Update or create student data
          if (studentData) {
            try {
              // Create a partial student object with only the fields we want to update
              const updateData = {
                userId: studentData.userId,
                timeZone: formData.timeZone || "Etc/UTC", // Ensure we have a fallback timezone
                portugueseLevel: formData.portugueseLevel,
                nativeLanguage: formData.nativeLanguage,
                learningGoals: formData.learningGoals,
                otherLanguages: formData.otherLanguages,
                // Add placeholder values for required package fields
                customerId: studentData.customerId || "pending",
                priceId: studentData.priceId || "pending",
                packageName: studentData.packageName || "pending",
                // Preserve existing values
                credits: studentData.credits,
                hasAccess: studentData.hasAccess,
                // We'll set this to true after all steps are completed
                hasCompletedOnboarding: false
              };

              const studentUpdateResult = await editStudent(user.id, updateData as Student);
              
              if (!studentUpdateResult) {
                throw new Error(tErrors("failedToUpdateStudentProfile"));
              }
            } catch (studentUpdateError) {
              console.error("Error updating student data:", studentUpdateError);
              throw new Error(
                studentUpdateError instanceof Error 
                  ? studentUpdateError.message 
                  : tErrors("failedToUpdateStudentProfile")
              );
            }
          }

          // Mark this step as completed
          setCompletedSteps(prev => [...prev, currentStep]);

          // Move to the next step
          setCurrentStep(prev => prev + 1);
        } catch (step1Error) {
          console.error("Error in step 1:", step1Error);
          setErrors({
            general: step1Error instanceof Error ? step1Error.message : tErrors("failedToSavePersonalInfo")
          });
          return;
        }
      } 
      // If this is the second step, validate class selection
      else if (currentStep === 2) {
        if (!formData.selectedTeacherId || !formData.classStartDateTime || !formData.classEndDateTime) {
          setErrors({
            general: tErrors("missingRequiredFields")
          });
          setLoading(false);
          return;
        }

        try {
          // Get the latest student data
          const updatedStudentData = await getStudent(user.id);
          
          if (!updatedStudentData) {
            throw new Error(tErrors("studentNotFound"));
          }

          // Calculate class duration in minutes (for validation)
          const startTime = new Date(formData.classStartDateTime);
          const endTime = new Date(formData.classEndDateTime);
          const durationMs = endTime.getTime() - startTime.getTime();
          const durationMinutes = Math.round(durationMs / (1000 * 60));

          // Store class details in form data for later use
          const pendingClass = {
            teacherId: formData.selectedTeacherId,
            studentId: updatedStudentData.id,
            startDateTime: startTime,
            endDateTime: endTime,
            duration: durationMinutes,
            notes: formData.classNotes || "",
            status: "PENDING" as const // Will be scheduled after payment
          };

          setFormData(prev => ({
            ...prev,
            pendingClass
          }));

          // Mark this step as completed
          setCompletedSteps(prev => [...prev, currentStep]);

          // Move to the next step
          setCurrentStep(prev => prev + 1);
        } catch (step2Error) {
          console.error("Error in step 2:", step2Error);
          setErrors({
            general: step2Error instanceof Error ? step2Error.message : tErrors("failedToProcessClassSelection")
          });
          return;
        }
      } 
      // If this is the third step (pricing), store form data in localStorage
      else if (currentStep === 3) {
        try {
          // Store form data in localStorage before proceeding to checkout
          localStorage.setItem("onboardingFormData", JSON.stringify({
            ...formData,
            classStartDateTime: formData.classStartDateTime?.toISOString(),
            classEndDateTime: formData.classEndDateTime?.toISOString(),
            pendingClass: formData.pendingClass ? {
              ...formData.pendingClass,
              startDateTime: formData.pendingClass.startDateTime.toISOString(),
              endDateTime: formData.pendingClass.endDateTime.toISOString(),
            } : undefined
          }));

          // Mark this step as completed
          setCompletedSteps(prev => [...prev, currentStep]);
        } catch (storageError) {
          console.error("Error storing form data:", storageError);
          setErrors({
            general: storageError instanceof Error ? storageError.message : tErrors("failedToSaveFormData")
          });
          return;
        }
      } else {
        // For future steps, just navigate to the next one
        setCompletedSteps(prev => [...prev, currentStep]);
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      setErrors({
        general: error instanceof Error ? error.message : tErrors("unknownError")
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles navigation to a specific step
   */
  const handleStepChange = (step: number): void => {
    setCurrentStep(step);
  };

  /**
   * Checks if a step is completed
   */
  const isStepCompleted = (step: number): boolean => {
    return completedSteps.includes(step);
  };

  /**
   * Checks if a step is disabled
   */
  const isStepDisabled = (step: number): boolean => {
    // First step is always enabled
    if (step === 1) return false;

    // Other steps are enabled if the previous step is completed
    return !isStepCompleted(step - 1);
  };

  /**
   * Renders the current step content
   */
  const renderStepContent = (): React.ReactNode => {
    const panelId = `step-panel-${currentStep}`;
    const stepId = `step-${currentStep}`;

    const content = (() => {
      switch (currentStep) {
        case 1:
          return (
            <Step1PersonalInfo
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              handleMultiSelectChange={handleMultiSelectChange}
            />
          );
        case 2:
          return (
            <Step2TeacherSelection
              key="teacher-selection"
              formData={formData}
              errors={errors}
              handleSelectChange={handleSelectChange}
              handleDateTimeChange={handleDateTimeChange}
              handleInputChange={handleInputChange}
              setIsStepValid={(isValid) => {
                if (isValid && !completedSteps.includes(2)) {
                  setCompletedSteps(prev => prev.includes(2) ? prev : [...prev, 2]);
                }
              }}
            />
          );
        case 3:
          return <Step3Pricing formData={formData} />;
        default:
          return null;
      }
    })();

    return (
      <div 
        id={panelId}
        role="tabpanel"
        aria-labelledby={stepId}
        tabIndex={0}
      >
        {content}
      </div>
    );
  };

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto px-4 py-16 md:py-24 max-w-4xl container"
    >
      {/* Stepper */}
      <Stepper
        currentStep={currentStep}
        totalSteps={3}
        onStepChange={handleStepChange}
        isStepCompleted={isStepCompleted}
        isStepDisabled={isStepDisabled}
      />

      {/* Step Content */}
      <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
        {renderStepContent()}

        {/* Error message */}
        {errors.general && (
          <div className="mb-4 text-red-500 text-center" role="alert">
            {errors.general}
          </div>
        )}

        {/* Data Privacy Notice */}
        {currentStep === 1 && (
          <div className="mt-6 mb-4 text-gray-500 dark:text-gray-400 text-xs leading-none">
            {t("step1.dataPrivacy.text")}{" "}
            <Link
              href={t("step1.dataPrivacy.link")}
              className="font-medium text-green-700 hover:text-green-800 dark:hover:text-green-400 dark:text-green-500 hover:underline"
            >
              {t("step1.dataPrivacy.linkText")}
            </Link>
            .
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-4">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={loading}
            >
              {tFormActions("back")}
            </Button>
          )}

          <div className={currentStep > 1 ? "ml-auto" : "ml-auto"}>
            <Button
              type="submit"
              disabled={loading}
              variant="default"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  {tFormActions("loading")}
                </>
              ) : currentStep === 3 ? (
                tFormActions("submit")
              ) : (
                tFormActions("next")
              )}
            </Button>
          </div>
        </div>
      </form>
    </motion.section>
  );
}
