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
 * @returns {React.JSX.Element} The validation summary component
 */
export default function ValidationSummary({
  isStepValid,
  selectedTeacher,
  selectedDate,
  selectedTimeSlot,
  t
}: ValidationSummaryProps): React.JSX.Element {
  return (
    <div className={`mt-6 p-4 rounded-lg border ${isStepValid
        ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
        : "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300"
      }`}>
      <div className="flex items-center">
        {isStepValid ? (
          <>
            <div className="flex-shrink-0 mr-3">
              <div className="flex justify-center items-center bg-green-100 dark:bg-green-800 rounded-full w-8 h-8">
                <svg className="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="font-medium">{t("step2.validationComplete", { default: "All selections complete" })}</h3>
              <p className="mt-1 text-sm">{t("step2.readyForNextStep", { default: "You're ready to proceed to the next step" })}</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex-shrink-0 mr-3">
              <div className="flex justify-center items-center bg-amber-100 dark:bg-amber-800 rounded-full w-8 h-8">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="font-medium">{t("step2.validationIncomplete")}</h3>
              <p className="mt-1 text-sm">{t("step2.completeAllSelections")}</p>
              <ul className="mt-2 text-sm list-disc list-inside">
                {!selectedTeacher && <li>{t("step2.selectTeacherRequired")}</li>}
                {!selectedDate && <li>{t("step2.selectDateRequired")}</li>}
                {!selectedTimeSlot && <li>{t("step2.selectTimeRequired")}</li>}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 