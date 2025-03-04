import React from 'react';
import { WarningCircle, Clock, ArrowsClockwise } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  teachersError: string | null;
  availabilityError: string | null;
  refreshAvailabilityData: () => Promise<void>;
  t: any; // Translation function
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
 * Component to display errors related to teacher selection and availability
 */
export function ErrorDisplay({ teachersError, availabilityError, refreshAvailabilityData, t }: ErrorDisplayProps) {
  // Only render if there are errors
  if (!teachersError && !availabilityError) return null;

  return (
    <div className="space-y-4 mt-4">
      {teachersError && (
        <div className="bg-red-50 p-4 border border-red-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <WarningCircle className="w-5 h-5 text-red-500" weight="fill" />
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-red-800 text-sm">
                {t('teacher_selection.errors.teacher_info_issue')}
              </h3>
              <div className="mt-2 text-red-700 text-sm">
                <p>{teachersError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {availabilityError && (
        <div className={`${
          isTimeSlotTakenError(availabilityError) 
            ? 'bg-amber-50 border-amber-200' 
            : isTeacherScheduleError(availabilityError)
              ? 'bg-blue-50 border-blue-200'
              : 'bg-red-50 border-red-200'
        } border rounded-md p-4`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {isTimeSlotTakenError(availabilityError) ? (
                <Clock className="w-5 h-5 text-amber-500" weight="fill" />
              ) : isTeacherScheduleError(availabilityError) ? (
                <WarningCircle className="w-5 h-5 text-blue-500" weight="fill" />
              ) : (
                <WarningCircle className="w-5 h-5 text-red-500" weight="fill" />
              )}
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-gray-800 text-sm">
                {isTimeSlotTakenError(availabilityError)
                  ? t('teacher_selection.errors.availability_update')
                  : isTeacherScheduleError(availabilityError)
                    ? t('teacher_selection.errors.teacher_schedule')
                    : t('teacher_selection.errors.connection_issue')}
              </h3>
              <div className="mt-2 text-gray-700 text-sm">
                <p>{availabilityError}</p>
              </div>
              {isAvailabilityLoadingError(availabilityError) && (
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => refreshAvailabilityData()}
                    className="inline-flex items-center"
                  >
                    <ArrowsClockwise className="mr-2 w-4 h-4" />
                    {t('teacher_selection.refresh_availability')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}