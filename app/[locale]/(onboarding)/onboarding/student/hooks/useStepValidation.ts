import { useState, useCallback } from "react";
import { Step2FormData } from "../types";

/**
 * Hook return type for step validation
 */
interface UseStepValidationReturn {
  isValid: boolean;
  errorMessage: string | null;
  validateStep: (formData: Step2FormData) => boolean;
}

/**
 * Custom hook for validating step 2 form data
 * @returns {UseStepValidationReturn} The validation state and handlers
 */
export function useStepValidation(): UseStepValidationReturn {
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateStep = useCallback((formData: Step2FormData): boolean => {
    // Reset validation state
    setErrorMessage(null);

    // Validate teacher selection
    if (!formData.selectedTeacher) {
      setErrorMessage("Please select a teacher");
      setIsValid(false);
      return false;
    }

    // Validate time slot selection
    if (!formData.selectedTimeSlot) {
      setErrorMessage("Please select a time slot");
      setIsValid(false);
      return false;
    }

    // All validations passed
    setIsValid(true);
    return true;
  }, []);

  return {
    isValid,
    errorMessage,
    validateStep
  };
} 