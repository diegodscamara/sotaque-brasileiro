import { useCallback, useEffect, useState } from "react";
import { OnboardingFormData } from "../types";

/**
 * Custom hook for validating the teacher selection step
 * @param {string | null} selectedTeacher - The selected teacher ID
 * @param {Date | undefined} selectedDate - The selected date
 * @param {string | null} selectedTimeSlot - The selected time slot ID
 * @param {OnboardingFormData} formData - The form data
 * @param {Function | undefined} setIsStepValid - Function to set step validity
 * @returns {Object} Validation state and functions
 */
export function useStepValidation(
  selectedTeacher: string | null,
  selectedDate: Date | undefined,
  selectedTimeSlot: string | null,
  formData: OnboardingFormData,
  setIsStepValid?: (isValid: boolean) => void
): {
  isStepValid: boolean;
  validateStep: () => boolean;
} {
  const [isStepValid, setStepValid] = useState(false);

  // Validate the step based on required selections
  const validateStep = useCallback(() => {
    const hasTeacher = !!selectedTeacher || !!formData.selectedTeacherId;
    const hasDate = !!selectedDate || !!formData.classStartDateTime;
    const hasTimeSlot = !!selectedTimeSlot || (!!formData.classStartDateTime && !!formData.classEndDateTime);
    
    const isValid = hasTeacher && hasDate && hasTimeSlot;
    
    setStepValid(isValid);
    
    if (setIsStepValid) {
      setIsStepValid(isValid);
    }
    
    return isValid;
  }, [selectedTeacher, selectedDate, selectedTimeSlot, formData, setIsStepValid]);

  // Validate the step whenever dependencies change
  useEffect(() => {
    validateStep();
  }, [validateStep]);

  return {
    isStepValid,
    validateStep
  };
} 