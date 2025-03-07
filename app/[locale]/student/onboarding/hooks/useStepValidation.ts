import { useCallback, useEffect, useState } from "react";
import { OnboardingFormData } from "../types";

/**
 * Custom hook for validating the teacher selection step
 * @param {OnboardingFormData} formData - The form data
 * @param {string | null} selectedTeacher - The selected teacher ID
 * @param {Date | undefined} selectedDate - The selected date
 * @param {string | null} selectedTimeSlot - The selected time slot ID
 * @param {Record<string, string | undefined>} errors - Form errors
 * @returns {Object} Validation state and functions
 */
export function useStepValidation(
  formData: OnboardingFormData,
  selectedTeacher: string | null,
  selectedDate: Date | undefined,
  selectedTimeSlot: string | null,
  errors: Record<string, string | undefined>
): {
  isStepValid: boolean;
  validateStep: () => boolean;
} {
  const [isStepValid, setStepValid] = useState(false);

  // Validate the step based on required selections
  const validateStep = useCallback(() => {
    // Check for required fields
    const hasTeacher = !!selectedTeacher || !!formData.selectedTeacherId;
    const hasDate = !!selectedDate || !!formData.classStartDateTime;
    const hasTimeSlot = !!selectedTimeSlot || (!!formData.classStartDateTime && !!formData.classEndDateTime);
    
    // Check for errors
    const hasErrors = Object.keys(errors).some(key => 
      key === 'selectedTeacherId' || 
      key === 'classStartDateTime' || 
      key === 'classEndDateTime' || 
      key === 'general'
    );
    
    const isValid = hasTeacher && hasDate && hasTimeSlot && !hasErrors;
    
    setStepValid(isValid);
    
    return isValid;
  }, [
    selectedTeacher, 
    selectedDate, 
    selectedTimeSlot, 
    formData.selectedTeacherId, 
    formData.classStartDateTime, 
    formData.classEndDateTime,
    errors
  ]);

  // Validate the step whenever dependencies change
  useEffect(() => {
    validateStep();
  }, [validateStep]);

  return {
    isStepValid,
    validateStep
  };
} 