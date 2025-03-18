import { useState, useCallback } from "react";
import { Step2FormData } from "../types";

/**
 * Hook return type for step validation
 */
interface UseStepValidationReturn {
  isValid: boolean;
  errorMessage: string | null;
  validateStep: (formData: Step2FormData) => boolean;
  isReadyToAdvance: boolean;
  setReadyToAdvance: (ready: boolean) => void;
}

/**
 * Custom hook for validating step 2 form data
 * @returns {UseStepValidationReturn} The validation state and handlers
 */
export function useStepValidation(): UseStepValidationReturn {
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Add a separate state to track if user is ready to advance
  const [isReadyToAdvance, setReadyToAdvance] = useState(false);

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

    // All validations passed - but this only means the form is VALID
    // It doesn't mean the user is ready to advance to the next step
    setIsValid(true);
    
    // IMPORTANT: We don't set isReadyToAdvance here.
    // That will only be set when the user explicitly clicks "Next"
    
    return true;
  }, []);

  return {
    isValid,
    errorMessage,
    validateStep,
    isReadyToAdvance,
    setReadyToAdvance
  };
} 