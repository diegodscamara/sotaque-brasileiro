import React from "react";

interface StepHeaderProps {
  t: any;
  selectedTeacher: string | null;
  selectedDate: Date | undefined;
  selectedTimeSlot: string | null;
}

/**
 * Header component for Step 2 of the onboarding process
 * @param {StepHeaderProps} props - Component props
 * @returns {React.JSX.Element} The step header component
 */
export default function StepHeader({
  t,
  selectedTeacher,
  selectedDate,
  selectedTimeSlot
}: StepHeaderProps): React.JSX.Element {
  return (
    <div className="mb-6">
      <h1 className="font-semibold text-2xl">{t("step2.title")}</h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">{t("step2.subtitle")}</p>

      {/* Required selections indicator */}
      <div className="mt-3 text-sm">
        <p className="text-gray-500 dark:text-gray-400">
          {t("step2.requiredSelections", { default: "Required selections" })}:
        </p>
        <div className="flex flex-wrap gap-2 mt-1">
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${selectedTeacher ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            }`}>
            {selectedTeacher ? "✓" : "○"} {t("step2.tabs.teachers")}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${selectedDate ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            }`}>
            {selectedDate ? "✓" : "○"} {t("step2.schedule.selectDate")}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${selectedTimeSlot ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            }`}>
            {selectedTimeSlot ? "✓" : "○"} {t("step2.schedule.selectTime")}
          </span>
        </div>
      </div>
    </div>
  );
} 