"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";

// Step Components
import Step1PersonalInfo from "./components/student-steps/Step1PersonalInfo";
import Step2TeacherSelection from "./components/student-steps/Step2TeacherSelection";
import Step3Pricing from "./components/student-steps/Step3Pricing";
import Stepper from "./components/Stepper";

// Utils and API
import { scheduleClass, fetchClasses, cancelPendingClass } from "@/app/actions/classes";
import { validateEmail } from "@/libs/utils/validation";
import { updateUser } from "@/app/actions/users";
import { updateStudent } from "@/app/actions/students";

// Types
import { OnboardingFormData, UserGender, ClassData } from "./types";
import { useUser } from "@/contexts/user-context";

/**
 * StudentOnboarding component handles the student onboarding process with multiple steps
 * @returns {React.JSX.Element} The student onboarding component
 */
export default function StudentOnboarding(): React.JSX.Element {
  // Translations
  const t = useTranslations("student.onboarding");
  const tErrors = useTranslations("errors");
  const tFormActions = useTranslations("student.onboarding.step1.formActions");

  // Get user data from context
  const { profile, isLoading: isUserLoading, refetchUserData } = useUser();

  // Form state - memoize initial state
  const initialFormState = useMemo(() => ({
    // Personal details
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    email: profile?.email || "",
    country: profile?.country || "",
    gender: profile?.gender || "prefer_not_to_say",
    timeZone: profile?.timeZone || "",

    // Learning preferences
    portugueseLevel: profile?.portugueseLevel || "",
    nativeLanguage: profile?.nativeLanguage || "",
    learningGoals: profile?.learningGoals || [],
    otherLanguages: profile?.otherLanguages || [],

    // Package details
    customerId: profile?.customerId || "",
    priceId: profile?.priceId || "",
    packageName: profile?.packageName || "",

    // Teacher selection and class scheduling
    selectedTeacher: null,
    selectedTimeSlot: null,
    notes: ""
  }), [profile]);

  // Form state
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormState);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Hooks
  const router = useRouter();

  // Refs to track initialization
  const hasLoadedUserData = useRef(false);
  const pendingClassRef = useRef<string | null>(null);

  /**
   * Pre-fills form with user data from context and handles step navigation
   */
  useEffect(() => {
    if (!hasLoadedUserData.current && profile) {
      try {
        // Set the flag to prevent multiple calls
        hasLoadedUserData.current = true;

        // Check for step parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const stepParam = urlParams.get('step');

        // If step parameter exists, set the current step
        if (stepParam) {
          const step = parseInt(stepParam, 10);
          if (!isNaN(step) && step >= 1 && step <= 3) {
            setCurrentStep(step);
            // Mark previous steps as completed
            const completedSteps = [];
            for (let i = 1; i < step; i++) {
              completedSteps.push(i);
            }
            setCompletedSteps(completedSteps);
            // Save completed steps to localStorage
            localStorage.setItem("onboardingCompletedSteps", JSON.stringify(completedSteps));
          }
        } else {
          // Check localStorage for saved step and completed steps
          const savedStep = localStorage.getItem("onboardingCurrentStep");
          const savedCompletedSteps = localStorage.getItem("onboardingCompletedSteps");

          if (savedStep) {
            const step = parseInt(savedStep, 10);
            if (!isNaN(step) && step >= 1 && step <= 3) {
              // Only set the step if we have completed steps data
              if (savedCompletedSteps) {
                try {
                  const parsedCompletedSteps = JSON.parse(savedCompletedSteps);
                  setCompletedSteps(parsedCompletedSteps);
                  setCurrentStep(step);
                } catch (error) {
                  console.error("Error parsing completed steps:", error);
                  // If there's an error parsing completed steps, reset to step 1
                  setCurrentStep(1);
                  setCompletedSteps([]);
                  localStorage.setItem("onboardingCurrentStep", "1");
                  localStorage.setItem("onboardingCompletedSteps", "[]");
                }
              } else {
                // If no completed steps saved, reset to step 1
                setCurrentStep(1);
                setCompletedSteps([]);
                localStorage.setItem("onboardingCurrentStep", "1");
                localStorage.setItem("onboardingCompletedSteps", "[]");
              }
            }
          }
        }

        // Check for saved onboarding data in localStorage
        const savedFormData = localStorage.getItem("onboardingFormData");
        if (savedFormData) {
          try {
            const parsedFormData = JSON.parse(savedFormData);
            
            // Only use localStorage data for steps 2 and 3
            // For step 1, always use profile data
            const step1Data = {
              firstName: profile.firstName || "",
              lastName: profile.lastName || "",
              email: profile.email || "",
              country: profile.country || "",
              gender: profile.gender || "prefer_not_to_say",
              timeZone: profile.timeZone || "",
              portugueseLevel: profile.portugueseLevel || "",
              nativeLanguage: profile.nativeLanguage || "",
              learningGoals: profile.learningGoals || [],
              otherLanguages: profile.otherLanguages || []
            };

            // Merge step 1 data with localStorage data for steps 2 and 3
            setFormData(prev => ({
              ...prev,
              ...step1Data,
              // Only use these fields from localStorage
              selectedTeacher: parsedFormData.selectedTeacher || null,
              selectedTimeSlot: parsedFormData.selectedTimeSlot ? {
                ...parsedFormData.selectedTimeSlot,
                startDateTime: new Date(parsedFormData.selectedTimeSlot.startDateTime),
                endDateTime: new Date(parsedFormData.selectedTimeSlot.endDateTime)
              } : null,
              notes: parsedFormData.notes || "",
              pendingClass: parsedFormData.pendingClass ? {
                ...parsedFormData.pendingClass,
                startDateTime: new Date(parsedFormData.pendingClass.startDateTime),
                endDateTime: new Date(parsedFormData.pendingClass.endDateTime)
              } : undefined
            }));

            // Set completed steps based on available data
            const completedStepsArray = [];

            // Step 1 is completed if all required fields are valid
            if (step1Data.firstName && 
                step1Data.lastName && 
                step1Data.email && 
                step1Data.timeZone && 
                step1Data.country && 
                step1Data.portugueseLevel && 
                step1Data.nativeLanguage && 
                step1Data.learningGoals && 
                step1Data.learningGoals.length > 0) {
              completedStepsArray.push(1);
            }

            // Step 2 is completed if we have teacher and class details from localStorage
            if (parsedFormData.pendingClass && parsedFormData.pendingClass.teacherId) {
              completedStepsArray.push(2);
            }

            setCompletedSteps(completedStepsArray);

            // Always start at step 1 if no steps are completed
            if (completedStepsArray.length === 0) {
              setCurrentStep(1);
              localStorage.setItem("onboardingCurrentStep", "1");
              localStorage.setItem("onboardingCompletedSteps", "[]");
            } else {
              // Navigate to the appropriate step only if previous steps are completed
              if (completedStepsArray.includes(2)) {
                setCurrentStep(3);
                localStorage.setItem("onboardingCurrentStep", "3");
              } else if (completedStepsArray.includes(1)) {
                setCurrentStep(2);
                localStorage.setItem("onboardingCurrentStep", "2");
              }
            }
          } catch (parseError) {
            console.error("Error parsing saved form data:", parseError);
            localStorage.removeItem("onboardingFormData");
            // If localStorage data is invalid, just use profile data
            setFormData(initialFormState);
          }
        } else {
          // If no localStorage data, use profile data
          setFormData(initialFormState);
        }

        // If onboarding is already completed and user has access, redirect to dashboard
        if (profile.hasCompletedOnboarding && profile.hasAccess) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setErrors({
          general: error instanceof Error ? error.message : tErrors("unknownError")
        });
      }
    }
  }, [profile, router, tErrors, initialFormState]);

  /**
   * Handles input change events for text inputs
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev: OnboardingFormData) => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  /**
   * Handles select change events
   */
  const handleSelectChange = (name: string, value: string): void => {
    if (name === "gender") {
      setFormData((prev: OnboardingFormData) => ({ ...prev, [name]: value as UserGender }));
    } else {
      setFormData((prev: OnboardingFormData) => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  /**
   * Handles multi-select change events
   */
  const handleMultiSelectChange = (name: string, values: string[]): void => {
    setFormData((prev: OnboardingFormData) => ({ ...prev, [name]: values }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  /**
   * Validates form inputs for the current step without updating state
   */
  const validateStepFields = useCallback((step: number): boolean => {
    if (step === 1) {
      // Validate personal details and learning preferences
      if (!formData.firstName) return false;
      if (!formData.lastName) return false;
      if (!formData.email || !validateEmail(formData.email)) return false;
      if (!formData.timeZone) return false;
      if (!formData.country) return false;
      if (!formData.portugueseLevel) return false;
      if (!formData.nativeLanguage) return false;
      if (formData.learningGoals.length === 0) return false;
    } else if (step === 2) {
      // Validate teacher selection and class scheduling
      if (!formData.selectedTeacher) return false;
      if (!formData.selectedTimeSlot) return false;
    }

    return true;
  }, [formData]);

  /**
   * Validates form inputs for the current step and updates error state
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
      if (!formData.selectedTeacher) {
        newErrors.selectedTeacher = t("step2.errors.teacherRequired");
      }

      if (!formData.selectedTimeSlot) {
        newErrors.selectedTimeSlot = t("step2.errors.timeSlotRequired");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Checks if the current step is valid without updating error state
   */
  const isCurrentStepValid = useCallback((): boolean => {
    return validateStepFields(currentStep);
  }, [currentStep, validateStepFields]);

  /**
   * Handles navigation to the next step
   */
  const handleNextStep = async (): Promise<void> => {
    if (!validateStep(currentStep)) return;

    setLoading(true);

    try {
      // Use context data instead of fetching
      if (!profile?.userId) {
        router.push("/signin");
        return;
      }

      // If this is the first step, save the personal data
      if (currentStep === 1) {
        try {
          // Update user data
          const updateResult = await updateUser(profile.userId, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            country: formData.country,
            gender: formData.gender
          });

          if (!updateResult) {
            throw new Error(tErrors("failedToUpdateUser"));
          }

          // Update student data
          if (!profile?.id) {
            throw new Error(tErrors("failedToUpdateStudent"));
          }

          const studentUpdateResult = await updateStudent(profile.id, {
            portugueseLevel: formData.portugueseLevel,
            nativeLanguage: formData.nativeLanguage,
            learningGoals: formData.learningGoals,
            otherLanguages: formData.otherLanguages,
            timeZone: formData.timeZone || "Etc/UTC",
            customerId: profile.customerId || "pending",
            priceId: profile.priceId || "pending",
            packageName: profile.packageName || "pending",
            credits: profile.credits,
            hasAccess: profile.hasAccess,
            hasCompletedOnboarding: false
          });

          if (!studentUpdateResult) {
            throw new Error(tErrors("failedToUpdateStudent"));
          }

          // Refresh user data in context
          await refetchUserData();

          // Mark this step as completed
          const newCompletedSteps = [...completedSteps, currentStep];
          setCompletedSteps(newCompletedSteps);
          localStorage.setItem("onboardingCompletedSteps", JSON.stringify(newCompletedSteps));

          // Save current step to localStorage
          localStorage.setItem("onboardingCurrentStep", (currentStep + 1).toString());

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
      // If this is the second step, save class selection with PENDING status
      else if (currentStep === 2) {
        if (!formData.selectedTeacher || !formData.selectedTimeSlot) {
          setErrors({
            general: tErrors("missingRequiredFields")
          });
          setLoading(false);
          return;
        }

        try {
          // Use student data from context
          const studentId = profile?.id;

          if (!studentId) {
            throw new Error(tErrors("failedToCreateStudentProfile"));
          }

          // Store the current pending class ID before potentially cancelling it
          let existingPendingClassId = null;

          // Only cancel existing pending classes if we're creating a new one with different details
          try {
            // Fetch all pending classes for this specific student
            const existingPendingClasses = await fetchClasses({
              studentId: studentId,
              status: "PENDING"
            });

            // Check if we have existing pending classes
            if (existingPendingClasses && existingPendingClasses.data && existingPendingClasses.data.length > 0) {
              // Check if we're selecting the same class details
              const pendingClass = existingPendingClasses.data[0];

              // Double-check that this class belongs to the current student
              if (pendingClass.studentId === studentId) {
                existingPendingClassId = pendingClass.id;

                // Only cancel if we're selecting a different teacher or time
                const isSameTeacher = pendingClass.teacherId === formData.selectedTeacher?.id;
                const pendingStartTime = new Date(pendingClass.startDateTime).getTime();
                const selectedStartTime = formData.selectedTimeSlot?.startDateTime.getTime() || 0;
                const isSameTime = Math.abs(pendingStartTime - selectedStartTime) < 60000; // Within 1 minute

                if (!isSameTeacher || !isSameTime) {
                  await cancelPendingClass(pendingClass.id);
                  existingPendingClassId = null;
                }
              } else {
                console.log(`Found pending class ID ${pendingClass.id} but it belongs to student ID ${pendingClass.studentId}, not current student ID ${studentId}`);
              }
            }
          } catch (cancelError) {
            console.error("Error handling existing pending classes:", cancelError);
            // Continue with the process even if cancellation fails
          }

          // If we already have a valid pending class with the same details, use it
          if (existingPendingClassId) {
            // Store the pending class ID in the ref for cleanup if needed
            pendingClassRef.current = existingPendingClassId;

            // Mark this step as completed
            const newCompletedSteps = [...completedSteps, currentStep];
            setCompletedSteps(newCompletedSteps);
            localStorage.setItem("onboardingCompletedSteps", JSON.stringify(newCompletedSteps));

            // Save current step to localStorage
            localStorage.setItem("onboardingCurrentStep", (currentStep + 1).toString());

            // Move to the next step
            setCurrentStep(prev => prev + 1);
            setLoading(false);
            return;
          }

          // Calculate class duration in minutes (for validation)
          const startTime = formData.selectedTimeSlot?.startDateTime || new Date();
          const endTime = formData.selectedTimeSlot?.endDateTime || new Date();
          const durationMs = endTime.getTime() - startTime.getTime();
          const durationMinutes = Math.round(durationMs / (1000 * 60));

          // Create the class data for saving to the database
          const classData: ClassData = {
            id: '', // Will be generated by the database
            teacherId: formData.selectedTeacher?.id || '',
            studentId: studentId,
            startDateTime: formData.selectedTimeSlot?.startDateTime || new Date(),
            endDateTime: formData.selectedTimeSlot?.endDateTime || new Date(),
            duration: durationMinutes,
            notes: formData.notes,
            status: "PENDING",
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Save the class to the database with PENDING status
          const pendingClass = await scheduleClass(classData, { isOnboarding: true });

          if (!pendingClass) {
            throw new Error(tErrors("failedToCreatePendingClass"));
          }

          // Store the pending class ID in the ref for cleanup if needed
          pendingClassRef.current = pendingClass.id;

          // Store class details in form data for later use
          setFormData((prev: OnboardingFormData) => ({
            ...prev,
            pendingClass: {
              teacherId: formData.selectedTeacher?.id || '',
              studentId: studentId,
              startDateTime: formData.selectedTimeSlot?.startDateTime || new Date(),
              endDateTime: formData.selectedTimeSlot?.endDateTime || new Date(),
              duration: durationMinutes,
              notes: formData.notes || "",
              status: "PENDING"
            }
          }));

          // Mark this step as completed
          const newCompletedSteps = [...completedSteps, currentStep];
          setCompletedSteps(newCompletedSteps);
          localStorage.setItem("onboardingCompletedSteps", JSON.stringify(newCompletedSteps));

          // Save current step to localStorage
          localStorage.setItem("onboardingCurrentStep", (currentStep + 1).toString());

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

          // Clear the current step and completed steps from localStorage as onboarding is complete
          localStorage.removeItem("onboardingCurrentStep");
          localStorage.removeItem("onboardingCompletedSteps");

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
        const newCompletedSteps = [...completedSteps, currentStep];
        setCompletedSteps(newCompletedSteps);
        localStorage.setItem("onboardingCompletedSteps", JSON.stringify(newCompletedSteps));
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
    // Save the current step to localStorage when manually changing steps
    localStorage.setItem("onboardingCurrentStep", step.toString());
  };

  /**
   * Checks if a step is completed
   */
  const isStepCompleted = (step: number): boolean => {
    // Step 1 is only completed if all required fields are valid
    if (step === 1) {
      return validateStepFields(1);
    }
    // For other steps, check if they're in the completed steps array
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
              formData={{
                selectedTeacher: formData.selectedTeacher,
                selectedTimeSlot: formData.selectedTimeSlot,
                timeZone: formData.timeZone,
                notes: formData.notes
              }}
              errors={errors as Record<string, string>}
              handleInputChange={(name: string, value: any) => {
                setFormData((prev: OnboardingFormData) => ({ ...prev, [name]: value }));
                setErrors(prev => ({ ...prev, [name]: undefined }));
              }}
              t={t}
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

  /**
   * Cleanup pending class when user leaves the page
   */
  useEffect(() => {
    // Function to clean up pending class
    const cleanupPendingClass = async () => {
      if (pendingClassRef.current) {
        try {
          await cancelPendingClass(pendingClassRef.current);
        } catch (error) {
          console.error("Failed to clean up pending class:", error);
        }
      }
    };

    // Handle beforeunload event
    const handleBeforeUnload = () => {
      // We can't use async functions directly with beforeunload
      // So we'll make a synchronous request to a cleanup endpoint
      if (pendingClassRef.current && currentStep === 3) {
        // Only attempt cleanup if we're on step 3 (after class creation, before checkout)
        const classId = pendingClassRef.current;

        try {
          // Use navigator.sendBeacon for a non-blocking request that will complete even as the page unloads
          const endpoint = `/api/cleanup-pending-class?classId=${classId}`;
          const success = navigator.sendBeacon(endpoint);

          console.log(`Sent cleanup request for class: ${classId}, success: ${success}`);
        } catch (error) {
          console.error("Error sending cleanup request:", error);
        }
      }
    };

    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // If the component unmounts normally (not from page unload),
      // we can run the async cleanup directly
      if (currentStep === 3) {
        cleanupPendingClass();
      }
    };
  }, [currentStep]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
              disabled={loading || !isCurrentStepValid()}
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
