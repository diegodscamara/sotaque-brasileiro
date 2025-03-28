"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Step Components
import Step1PersonalInfo from "./components/student-steps/Step1PersonalInfo";
import Step2TeacherSelection from "./components/student-steps/Step2TeacherSelection";
import Step3Pricing from "./components/student-steps/Step3Pricing";
import Stepper from "./components/Stepper";

// Contexts and Hooks
import { useUser } from "@/contexts/user-context";
import { useOnboarding } from "@/contexts/onboarding-context";

// Types
import { OnboardingFormData, UserGender } from "./types";
import { ChangeEvent } from "react";

// Utils and API
import { updateUser } from "@/app/actions/users";
import { updateStudent } from "@/app/actions/students";
import { scheduleClass } from "@/app/actions/classes";

/**
 * StudentOnboarding component handles the student onboarding process with multiple steps
 * @returns {React.JSX.Element} The student onboarding component
 */
export default function StudentOnboarding(): React.JSX.Element {
  // Translations
  const t = useTranslations("student.onboarding");
  const tErrors = useTranslations("errors");
  const tFormActions = useTranslations("student.onboarding.step1.formActions");

  // Contexts
  const { profile, refetchUserData } = useUser();
  const {
    progress,
    isLoading: isProgressLoading,
    completeCurrentStep,
    resetCurrentStep,
    goToStep,
    isStepCompleted
  } = useOnboarding();

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
    selectedDate: null,
    selectedTimeSlot: null,
    notes: ""
  }), [profile]);

  // Local state
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Router
  const router = useRouter();

  /**
   * Handles input change events for text inputs
   */
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, valueOrEvent?: any): void => {
    let name: string;
    let value: any;

    if (typeof e === 'string') {
      // Handle direct name/value calls (used by Step2TeacherSelection)
      name = e;
      value = valueOrEvent;
    } else {
      // Handle event-based calls (used by Step1PersonalInfo)
      name = e.target.name;
      value = e.target.value;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    // Only set error to undefined if it exists
    setErrors(prev => {
      const newErrors = { ...prev };
      if (name in newErrors) {
        delete newErrors[name];
      }
      return newErrors;
    });
  }, []);

  /**
   * Handles select change events
   */
  const handleSelectChange = useCallback((name: string, value: string): void => {
    if (name === "gender") {
      setFormData(prev => ({ ...prev, [name]: value as UserGender }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Only set error to undefined if it exists
    setErrors(prev => {
      const newErrors = { ...prev };
      if (name in newErrors) {
        delete newErrors[name];
      }
      return newErrors;
    });
  }, []);

  /**
   * Handles multi-select change events
   */
  const handleMultiSelectChange = useCallback((name: string, values: string[]): void => {
    setFormData(prev => ({ ...prev, [name]: values }));
    // Only set error to undefined if it exists
    setErrors(prev => {
      const newErrors = { ...prev };
      if (name in newErrors) {
        delete newErrors[name];
      }
      return newErrors;
    });
  }, []);

  /**
   * Validates form inputs for the current step without updating state
   */
  const validateStepFields = useCallback((step: number): boolean => {
    if (step === 1) {
      if (!formData.firstName) return false;
      if (!formData.lastName) return false;
      if (!formData.email) return false;
      if (!formData.timeZone) return false;
      if (!formData.country) return false;
      if (!formData.portugueseLevel) return false;
      if (!formData.nativeLanguage) return false;
      if (formData.learningGoals.length === 0) return false;
    } else if (step === 2) {
      if (!formData.selectedTeacher) return false;
      if (!formData.selectedDate) return false;
      if (!formData.selectedTimeSlot) return false;
    }

    return true;
  }, [formData]);

  /**
   * Validates form inputs for the current step and updates error state
   */
  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName) {
        newErrors.firstName = t("step1.forms.personalDetails.firstNameError");
      }
      if (!formData.lastName) {
        newErrors.lastName = t("step1.forms.personalDetails.lastNameError");
      }
      if (!formData.email) {
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
      if (!formData.selectedTeacher) {
        newErrors.selectedTeacher = t("step2.errors.teacherRequired");
      }
      if (!formData.selectedDate) {
        newErrors.selectedDate = t("step2.errors.dateRequired");
      }
      if (!formData.selectedTimeSlot) {
        newErrors.selectedTimeSlot = t("step2.errors.timeSlotRequired");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t, tErrors]);

  /**
   * Handles navigation to the next step
   */
  const handleNextStep = async (): Promise<void> => {
    if (!progress) return;

    const currentStep = progress.currentStep || 1;
    if (!validateStep(currentStep)) return;

    setLoading(true);

    try {
      if (!profile?.userId) {
        router.push("/signin");
        return;
      }

      // Handle step-specific logic
      if (currentStep === 1) {
        // Update user and student data
        await updateUser(profile.userId, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          country: formData.country,
          gender: formData.gender
        });

        if (profile.id) {
          await updateStudent(profile.id, {
            portugueseLevel: formData.portugueseLevel,
            nativeLanguage: formData.nativeLanguage,
            learningGoals: formData.learningGoals,
            otherLanguages: formData.otherLanguages,
            timeZone: formData.timeZone || "Etc/UTC"
          });
        }

        await refetchUserData();
      }

      if (currentStep === 2) {
        // Update the selected teacher in the form data
        await scheduleClass({
          teacherId: formData.selectedTeacher?.id || "",
          studentId: profile?.id || "",
          startDateTime: formData.selectedTimeSlot?.startDateTime || new Date(),
          endDateTime: formData.selectedTimeSlot?.endDateTime || new Date(),
          notes: formData.notes,
          status: "PENDING",
          duration: formData.selectedTimeSlot ? 
            (formData.selectedTimeSlot.endDateTime.getTime() - formData.selectedTimeSlot.startDateTime.getTime()) / (1000 * 60) : 
            60, // Default to 60 minutes if no time slot selected
          id: "", // Will be generated by the database
          createdAt: new Date(),
          updatedAt: new Date()
        },
          {
            isOnboarding: true
          }
        );
      }

      // Complete the current step and move to the next
      await completeCurrentStep();
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
   * Renders the current step content
   */
  const renderStepContent = (): React.ReactNode => {
    if (!progress) return null;

    const currentStep = progress.currentStep || 1;

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
              selectedDate: formData.selectedDate,
              selectedTimeSlot: formData.selectedTimeSlot,
              timeZone: formData.timeZone,
              notes: formData.notes,
              studentId: profile?.id
            }}
            errors={errors}
            handleInputChange={handleInputChange}
            t={t}
          />
        );
      case 3:
        return <Step3Pricing formData={formData} />;
      default:
        return null;
    }
  };

  if (isProgressLoading) {
    return <div>Loading...</div>;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto px-4 py-16 md:py-24 max-w-4xl container"
    >
      {/* Stepper */}
      <Stepper
        currentStep={progress?.currentStep || 1}
        totalSteps={3}
        onStepChange={goToStep}
        isStepCompleted={isStepCompleted}
        isStepDisabled={(step) => step > 1 && !isStepCompleted(step - 1)}
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

        {/* Navigation buttons */}
        <div className="flex justify-between mt-4">
          {progress?.currentStep && progress.currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetCurrentStep();
                goToStep(progress.currentStep - 1);
              }}
              disabled={loading}
            >
              {tFormActions("back")}
            </Button>
          )}

          <div className={progress?.currentStep && progress.currentStep > 1 ? "ml-auto" : "ml-auto"}>
            <Button
              type="submit"
              disabled={loading || !validateStepFields(progress?.currentStep || 1)}
              variant="default"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  {tFormActions("loading")}
                </>
              ) : progress?.currentStep === 3 ? (
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
