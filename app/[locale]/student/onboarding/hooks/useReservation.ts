import { useState, useEffect, useCallback, useRef } from "react";
import { 
  createTemporaryReservation, 
  cancelTemporaryReservation 
} from "@/app/actions/availability";
import {  createTimeSlotRepresentation } from "@/app/utils/timezone";

// Add interface for reservation
interface Reservation {
  id: string;
  expiresAt: Date;
  timeoutId?: NodeJS.Timeout;
}

/**
 * Custom hook for managing temporary reservations
 * @param {Function} refreshAvailabilityData - Function to refresh availability data
 * @returns {Object} Reservation state and handlers
 */
export function useReservation(
  refreshAvailabilityData: () => Promise<void>
): object {
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null);
  const [reservationExpiry, setReservationExpiry] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  
  // Use a ref to store the refreshAvailabilityData function
  // This allows us to update it later without causing re-renders
  const refreshAvailabilityRef = useRef(refreshAvailabilityData);
  
  // Use refs to break circular dependencies between functions
  const createReservationRef = useRef<any>(null);
  const cancelReservationRef = useRef<any>(null);
  const refreshReservationRef = useRef<any>(null);
  
  // Update the ref when the function changes
  useEffect(() => {
    refreshAvailabilityRef.current = refreshAvailabilityData;
    // Don't call the function here, just update the ref
  }, [refreshAvailabilityData]);

  // Function to cancel a reservation
  const cancelReservation = useCallback(async () => {
    if (!currentReservation) return;
    
    try {
      await cancelTemporaryReservation(currentReservation.id);
      
      // Clear the timeout
      if (currentReservation.timeoutId) {
        clearTimeout(currentReservation.timeoutId);
      }
      
      console.log(`Cancelled reservation: ${currentReservation.id}`);
      
      setCurrentReservation(null);
      setReservationExpiry(null);
    } catch (error) {
      console.error("Error canceling reservation:", error);
    }
  }, [currentReservation]);
  
  // Store the cancelReservation function in a ref
  useEffect(() => {
    cancelReservationRef.current = cancelReservation;
  }, [cancelReservation]);

  // Function to create a temporary reservation
  const createReservation = useCallback(async (
    teacherId: string,
    startDateTime: Date,
    endDateTime: Date,
    studentId: string
  ) => {
    try {
      // Cancel any existing reservation first
      if (currentReservation && cancelReservationRef.current) {
        console.log(`Cancelling existing reservation ${currentReservation.id} before creating a new one`);
        await cancelReservationRef.current();
      }
      
      // Get the browser's timezone for logging
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Create a time slot representation for logging
      const timeSlot = createTimeSlotRepresentation(startDateTime, endDateTime, browserTimezone);
      
      console.log(`Creating reservation for teacher ${teacherId}, student ${studentId}`);
      console.log(`  - UTC time: ${timeSlot.utcStart} to ${timeSlot.utcEnd}`);
      console.log(`  - Browser local time: ${timeSlot.displayTime} on ${timeSlot.localDate}`);
      
      const { reservationId, expiresAt } = await createTemporaryReservation(
        teacherId,
        startDateTime,
        endDateTime,
        studentId
      );
      
      // Log the expiry time in the browser's timezone
      const expiryTimeSlot = createTimeSlotRepresentation(expiresAt, expiresAt, browserTimezone);
      
      console.log(`Successfully created/retrieved reservation ${reservationId}`);
      console.log(`  - Expires at UTC: ${expiresAt.toISOString()}`);
      console.log(`  - Expires at local time: ${expiryTimeSlot.localStart} on ${expiryTimeSlot.localDate}`);
      
      // Set up a timer to refresh the reservation before it expires
      const timeoutId = setTimeout(() => {
        // Refresh the reservation 1 minute before it expires
        if (refreshReservationRef.current) {
          refreshReservationRef.current(teacherId, startDateTime, endDateTime, studentId);
        }
      }, expiresAt.getTime() - new Date().getTime() - 60000); // 1 minute before expiry
      
      setCurrentReservation({ 
        id: reservationId, 
        expiresAt,
        timeoutId
      });
      
      setReservationExpiry(expiresAt);
      
      return reservationId;
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      
      // Check if this is an error we can handle silently
      const errorMessage = error.message || '';
      const isAlreadyReservedByThisStudent = errorMessage.includes("already has a reservation");
      
      if (isAlreadyReservedByThisStudent) {
        console.log("This time slot is already reserved by this student, not showing error to user");
        // We could try to retrieve the existing reservation here if needed
      }
      
      // Refresh availability data if needed
      if (refreshAvailabilityRef.current) {
        console.log("Refreshing availability data after reservation error");
        refreshAvailabilityRef.current();
      }
      
      return null;
    }
  }, [currentReservation]);
  
  // Store the createReservation function in a ref
  useEffect(() => {
    createReservationRef.current = createReservation;
  }, [createReservation]);
  
  // Function to refresh a reservation
  const refreshReservation = useCallback(async (
    teacherId: string,
    startDateTime: Date,
    endDateTime: Date,
    studentId: string
  ) => {
    try {
      // Cancel the current reservation
      if (currentReservation && cancelReservationRef.current) {
        await cancelReservationRef.current();
      }
      
      // Create a new reservation
      if (createReservationRef.current) {
        await createReservationRef.current(teacherId, startDateTime, endDateTime, studentId);
      }
    } catch (error) {
      console.error("Error refreshing reservation:", error);
    }
  }, [currentReservation]);
  
  // Store the refreshReservation function in a ref
  useEffect(() => {
    refreshReservationRef.current = refreshReservation;
  }, [refreshReservation]);

  // Add cleanup effect to cancel reservation when component unmounts
  useEffect(() => {
    return () => {
      if (currentReservation?.timeoutId) {
        clearTimeout(currentReservation.timeoutId);
      }
      
      if (currentReservation) {
        cancelTemporaryReservation(currentReservation.id)
          .catch(error => console.error("Error canceling reservation on unmount:", error));
      }
    };
  }, [currentReservation]);

  // Function to handle refreshing availability data
  const handleRefreshAvailability = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshAvailabilityData();
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error("Error refreshing availability:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshAvailabilityData]);

  return {
    currentReservation,
    reservationExpiry,
    isRefreshing,
    lastRefreshTime,
    createReservation,
    cancelReservation,
    refreshReservation,
    handleRefreshAvailability
  };
} 