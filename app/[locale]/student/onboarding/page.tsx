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
import Step2ComingSoon from "./components/Step2ComingSoon";
import Step3ComingSoon from "./components/Step3ComingSoon";
import Stepper from "./components/Stepper";

// Utils and API
import { createClient } from "@/libs/supabase/client";
import { getStudent } from "@/app/actions/students";
import { getUser, updateUser } from "@/app/actions/users";
import { editStudent } from "@/app/actions/students";
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
  const tShared = useTranslations("shared");
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
  const [errors, setErrors] = useState<Record<string, string>>({});
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
  }, []);

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

          // Get user and student data
          const userData = await getUser(user.id);
          const studentData = await getStudent(user.id);

          if (userData) {
            // Pre-fill form with existing user data
            setFormData(prev => ({
              ...prev,
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              email: userData.email || "",
              country: userData.country || prev.country,
              gender: userData.gender || "",
              timeZone: studentData?.timeZone || prev.timeZone,
              portugueseLevel: studentData?.portugueseLevel || "",
              nativeLanguage: studentData?.nativeLanguage || "",
              learningGoals: studentData?.learningGoals || [],
              otherLanguages: studentData?.otherLanguages || [],
              customerId: studentData?.customerId || "",
              priceId: studentData?.priceId || "",
              packageName: studentData?.packageName || "",
            }));
          }

          if (studentData) {
            // Set student data
            setStudentData(studentData as unknown as Student);

            // If onboarding is already completed, redirect to dashboard
            if (studentData.hasCompletedOnboarding) {
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
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

    // If this is the first step, save the data
    if (currentStep === 1) {
      setLoading(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/signin");
          return;
        }

        // Update user data
        await updateUser(user.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          country: formData.country,
          gender: formData.gender,
        });

        // Update or create student data
        if (studentData) {
          // Create a partial student object with only the fields we want to update
          const updateData = {
            userId: studentData.userId,
            timeZone: formData.timeZone,
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

          await editStudent(user.id, updateData as Student);
        }

        // Mark this step as completed
        setCompletedSteps(prev => [...prev, currentStep]);

        // Move to the next step
        setCurrentStep(prev => prev + 1);
      } catch (error) {
        console.error("Error saving onboarding data:", error);
        setErrors({
          general: error instanceof Error ? error.message : tErrors("unknownError")
        });
      } finally {
        setLoading(false);
      }
    } else {
      // For future steps, just navigate to the next one
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
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
        return <Step2ComingSoon />;
      case 3:
        return <Step3ComingSoon />;
      default:
        return null;
    }
  };

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto px-4 py-16 max-w-4xl container"
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
