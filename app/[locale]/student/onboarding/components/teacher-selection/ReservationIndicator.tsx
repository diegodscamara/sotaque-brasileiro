import React from "react";
import { format } from "date-fns";
import { formatDateInTimezone } from "@/app/utils/timezone";

interface ReservationIndicatorProps {
  t: any;
  reservationExpiry: Date;
  isRefreshing: boolean;
  lastRefreshTime: Date;
  refreshAvailabilityData: () => Promise<void>;
  timeZone: string;
}

/**
 * Component for displaying reservation information
 * @param {ReservationIndicatorProps} props - Component props
 * @returns {React.JSX.Element} The reservation indicator component
 */
export default function ReservationIndicator({
  t,
  reservationExpiry,
  isRefreshing,
  lastRefreshTime,
  refreshAvailabilityData,
  timeZone
}: ReservationIndicatorProps): React.JSX.Element {
  // Calculate minutes remaining until expiry
  const minutesRemaining = Math.max(0, Math.floor((reservationExpiry.getTime() - new Date().getTime()) / 60000));
  
  // Format the time remaining as a string (e.g., "5 minutes")
  const timeRemaining = `${minutesRemaining} ${minutesRemaining === 1 ? 'minute' : 'minutes'}`;
  
  // Format the last update time in the user's timezone
  const formattedLastUpdateTime = timeZone 
    ? formatDateInTimezone(lastRefreshTime, timeZone, 'HH:mm:ss')
    : format(lastRefreshTime, 'HH:mm:ss');
  
  return (
    <div className="flex items-center mt-3">
      <div className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-md text-green-800 dark:text-green-300 text-xs">
        <span className="font-medium">{t("step2.reservation.timeSlotReserved")}</span>
        <span className="ml-1">
          {t("step2.reservation.expiresIn", { 
            time: timeRemaining
          })}
        </span>
      </div>
      
      <button
        type="button"
        onClick={refreshAvailabilityData}
        disabled={isRefreshing}
        className="flex items-center ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-400 text-xs"
        aria-label={t("step2.reservation.refreshAvailability")}
      >
        {isRefreshing ? (
          <>
            <div className="mr-1 border-gray-500 border-t-2 rounded-full w-3 h-3 animate-spin"></div>
            {t("step2.reservation.refreshing")}
          </>
        ) : (
          <>
            <svg className="mr-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t("step2.reservation.refresh")}
          </>
        )}
      </button>
      
      <div className="ml-auto text-gray-500 dark:text-gray-400 text-xs">
        {t("step2.reservation.lastUpdated", { 
          time: formattedLastUpdateTime
        })}
      </div>
    </div>
  );
} 