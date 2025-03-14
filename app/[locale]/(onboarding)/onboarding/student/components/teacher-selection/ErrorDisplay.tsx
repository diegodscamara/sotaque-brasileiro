import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Warning } from "@phosphor-icons/react";

interface ErrorDisplayProps {
  teachersError: string | null;
  availabilityError: string | null;
  refreshAvailabilityData: () => Promise<void>;
  t: ReturnType<typeof useTranslations>;
}

/**
 * Helper function to determine if the error is about a time slot being taken
 */
const isTimeSlotTakenError = (error: string): boolean => {
  return error.includes('taken by another student') || 
         error.includes('no longer available');
};

/**
 * Helper function to determine if the error is about availability loading
 */
const isAvailabilityLoadingError = (error: string): boolean => {
  return error.includes('Failed to load') || 
         error.includes('connection');
};

/**
 * Helper function to determine if the error is about teacher schedule
 */
const isTeacherScheduleError = (error: string): boolean => {
  return error.includes('teacher\'s schedule') || 
         error.includes('teacher is not available');
};

/**
 * Component for displaying errors in the teacher selection process
 * @param {ErrorDisplayProps} props - Component props
 * @returns {React.JSX.Element | null} The error display component or null if no errors
 */
export default function ErrorDisplay({
  teachersError,
  availabilityError,
  refreshAvailabilityData,
  t
}: ErrorDisplayProps): React.JSX.Element | null {
  if (!teachersError && !availabilityError) {
    return null;
  }

  return (
    <div className="space-y-4">
      {teachersError && (
        <Alert variant="destructive">
          <Warning className="w-4 h-4" />
          <AlertTitle>{t("step2.errors.teacherLoadingError")}</AlertTitle>
          <AlertDescription>{teachersError}</AlertDescription>
        </Alert>
      )}

      {availabilityError && (
        <Alert variant="destructive">
          <Warning className="w-4 h-4" />
          <AlertTitle>{t("step2.errors.availabilityLoadingError")}</AlertTitle>
          <AlertDescription>
            <div className="flex flex-col gap-2">
              <p>{availabilityError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAvailabilityData}
                className="w-fit"
              >
                {t("step2.errors.retryButton")}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}