import React from "react";

interface ValidationSummaryProps {
  isStepValid: boolean;
  selectedTeacher: string | null;
  selectedDate: Date | undefined;
  selectedTimeSlot: string | null;
  t: any;
}

/**
 * Component for displaying validation summary
 * @param {ValidationSummaryProps} props - Component props
 * @returns {React.JSX.Element | null} The validation summary component or null if all selections are complete
 */
export default function ValidationSummary({
  isStepValid,
  selectedTeacher,
  selectedDate,
  selectedTimeSlot,
  t
}: ValidationSummaryProps): React.JSX.Element | null {
  // If all selections are complete, don't render the component
  if (isStepValid) {
    return null;
  }

  // Only render the warning message when there are incomplete selections
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 mt-6 p-4 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300">
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          <div className="flex justify-center items-center bg-amber-100 dark:bg-amber-800 rounded-full w-8 h-8">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <div>
          <h3 className="font-medium">{t("step2.validation.incomplete")}</h3>
          <p className="mt-1 text-sm">{t("step2.validation.completeAllSelections")}</p>
          <ul className="mt-2 text-sm list-disc list-inside">
            {!selectedTeacher && <li>{t("step2.validation.selectTeacherRequired")}</li>}
            {!selectedDate && <li>{t("step2.validation.selectDateRequired")}</li>}
            {!selectedTimeSlot && <li>{t("step2.validation.selectTimeRequired")}</li>}
          </ul>
        </div>
      </div>
    </div>
  );
} 