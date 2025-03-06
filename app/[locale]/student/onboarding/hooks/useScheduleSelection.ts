import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { OnboardingFormData } from "../types";
import { 
  getTeacherAvailabilityRange, 
  refreshAvailability
} from "@/app/actions/availability";
import { 
  standardizeDate, 
  createTimeSlotId, 
  formatDateInTimezone 
} from "@/app/utils/timezone";

// Types
interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  id: string;
  startDateTime: Date;
  endDateTime: Date;
  displayStartTime: string;
  displayEndTime: string;
}

/**
 * Custom hook for managing schedule selection in the student onboarding process.
 * Handles date selection, time slot management, and reservation creation.
 * 
 * @returns Schedule selection state and handlers
 */
export function useScheduleSelection(
  formData: OnboardingFormData,
  selectedTeacher: string | null,
  handleDateTimeChange: (name: string, value: Date) => void,
  handleSelectChange: (name: string, value: string) => void,
  createReservation?: (teacherId: string, startDateTime: Date, endDateTime: Date, studentId: string) => Promise<string | null>,
  cancelReservation?: () => Promise<void>,
  hasActiveReservation: boolean = false
) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(formData.classStartDateTime || undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [restoredDataChecked, setRestoredDataChecked] = useState(false);
  // Track if a time slot was just selected by the user to avoid showing confusing errors
  const [userJustSelectedTimeSlot, setUserJustSelectedTimeSlot] = useState(false);

  // Helper function to process availability data into time slots
  const processAvailabilityIntoTimeSlots = useCallback((availabilityData: any[], dateStr: string): TimeSlot[] => {
    if (!availabilityData || availabilityData.length === 0) {
      return [];
    }
    
    // Get the student's timezone or use browser timezone as fallback
    const studentTimezone = formData.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Process the availability data into 30-minute slots
    const slots: TimeSlot[] = [];
    
    availabilityData.forEach(availability => {
      // Standardize dates to ensure consistent time zone handling
      const start = standardizeDate(availability.startDateTime);
      const end = standardizeDate(availability.endDateTime);
      
      // Create 30-minute slots
      let slotStart = new Date(start);
      
      while (slotStart < end) {
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);
        
        // Don't create slots that extend beyond the availability end time
        if (slotEnd > end) break;
        
        // Create a display time in the student's timezone for the UI
        const displayStartTime = formatDateInTimezone(slotStart, studentTimezone, 'HH:mm');
        const displayEndTime = formatDateInTimezone(slotEnd, studentTimezone, 'HH:mm');
        
        // Create a unique ID that includes the date and display times
        const slotId = createTimeSlotId(dateStr, slotStart, slotEnd);
        
        // Log the time information for debugging
        console.log(`Creating time slot: ${slotId}`);
        console.log(`  - UTC start: ${slotStart.toISOString()}`);
        console.log(`  - UTC end: ${slotEnd.toISOString()}`);
        console.log(`  - Student timezone: ${studentTimezone}`);
        console.log(`  - Display time in student timezone: ${displayStartTime}-${displayEndTime}`);
        
        slots.push({
          id: slotId,
          startTime: displayStartTime,
          endTime: displayEndTime,
          isAvailable: true,
          startDateTime: new Date(slotStart),
          endDateTime: new Date(slotEnd),
          // Add display properties to help with debugging
          displayStartTime: displayStartTime,
          displayEndTime: displayEndTime
        });
        
        // Move to the next slot
        slotStart = new Date(slotEnd);
      }
    });
    
    return slots;
  }, [formData.timeZone]);

  // Function to update form data with selected time slot
  const updateFormWithTimeSlot = useCallback((slot: TimeSlot) => {
    // Standardize dates to ensure consistent time zone handling
    const standardizedStartDateTime = standardizeDate(slot.startDateTime);
    const standardizedEndDateTime = standardizeDate(slot.endDateTime);
    
    // Get the student's timezone for logging
    const studentTimezone = formData.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    console.log(`Updating form with time slot: ${slot.id}`);
    console.log(`  - UTC startDateTime: ${standardizedStartDateTime.toISOString()}`);
    console.log(`  - UTC endDateTime: ${standardizedEndDateTime.toISOString()}`);
    console.log(`  - Student timezone: ${studentTimezone}`);
    console.log(`  - Student local time: ${slot.startTime}-${slot.endTime}`);
    
    // Update form data
    handleDateTimeChange("classStartDateTime", standardizedStartDateTime);
    handleDateTimeChange("classEndDateTime", standardizedEndDateTime);
    
    // Calculate duration in minutes
    const durationMs = standardizedEndDateTime.getTime() - standardizedStartDateTime.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));
    handleSelectChange("classDuration", durationMinutes.toString());
  }, [handleDateTimeChange, handleSelectChange, formData.timeZone]);

  // Function to fetch availability for a date
  const fetchAvailabilityForDate = useCallback(async (date: Date, teacherId: string) => {
    if (!date || !teacherId) return;
    
    try {
      setIsLoadingTimeSlots(true);
      
      // Standardize the date to ensure consistent time zone handling
      const standardizedDate = standardizeDate(date);
      
      // Format date for API
      const formattedDate = format(standardizedDate, 'yyyy-MM-dd');
      
      // Get the student's timezone for logging
      const studentTimezone = formData.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      console.log(`Fetching availability for date: ${formattedDate}`);
      console.log(`  - Original date: ${date.toISOString()}`);
      console.log(`  - Standardized date: ${standardizedDate.toISOString()}`);
      console.log(`  - Student timezone: ${studentTimezone}`);
      
      // Fetch availability for the selected date and teacher
      const availability = await getTeacherAvailabilityRange(
        teacherId,
        formattedDate,
        formattedDate
      ) as any[];
      
      if (availability && availability.length > 0) {
        // Process the availability data into time slots
        const slots = processAvailabilityIntoTimeSlots(availability, formattedDate);
        
        // Update the time slots state
        setTimeSlots(slots);
        
        // Check if we have a class start time from restored data
        if (formData.classStartDateTime && !restoredDataChecked) {
          // Get the start time in the student's timezone
          const startTimeInStudentTimezone = formatDateInTimezone(
            formData.classStartDateTime, 
            studentTimezone, 
            'HH:mm'
          );
          
          // Find the matching time slot
          const matchingSlot = slots.find(
            slot => slot.startTime === startTimeInStudentTimezone
          );
          
          if (matchingSlot && matchingSlot.isAvailable) {
            // Set the selected time slot
            setSelectedTimeSlot(matchingSlot.id);
            
            // Update form data
            updateFormWithTimeSlot(matchingSlot);
            
            // Create a reservation if needed
            if (createReservation && formData.pendingClass?.studentId) {
              // Standardize dates to ensure consistent time zone handling
              const standardizedStartDateTime = standardizeDate(matchingSlot.startDateTime);
              const standardizedEndDateTime = standardizeDate(matchingSlot.endDateTime);
              
              createReservation(
                teacherId,
                standardizedStartDateTime,
                standardizedEndDateTime,
                formData.pendingClass.studentId
              );
            }
          }
          
          setRestoredDataChecked(true);
        }
        
        setAvailabilityError(null);
      } else {
        setTimeSlots([]);
        setAvailabilityError("No time slots available for this date. Please select another date.");
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      setTimeSlots([]);
      setAvailabilityError("Error fetching availability. Please try again.");
    } finally {
      setIsLoadingTimeSlots(false);
    }
  }, [formData, restoredDataChecked, processAvailabilityIntoTimeSlots, updateFormWithTimeSlot, createReservation]);

  // Function to refresh availability data
  const refreshAvailabilityData = useCallback(async () => {
    if (!selectedTeacher || !selectedDate || isRefreshing) return;
    
    // Check if we've refreshed recently (within the last 10 seconds)
    const now = new Date();
    const timeSinceLastRefreshMs = now.getTime() - lastRefreshTime.getTime();
    if (timeSinceLastRefreshMs < 10000) { // 10 seconds
      console.log('Skipping refresh - last refresh was less than 10 seconds ago');
      return;
    }
    
    console.log('Refreshing availability data');
    setIsRefreshing(true);
    
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Store the currently selected time slot info before refreshing
      const currentSelectedSlot = selectedTimeSlot ? 
        timeSlots.find(slot => slot.id === selectedTimeSlot) : null;
      
      // Use the refresh function
      const freshAvailability = await refreshAvailability(selectedTeacher, formattedDate);
      
      if (freshAvailability && freshAvailability.length > 0) {
        // Process the availability data into time slots
        const processedSlots = processAvailabilityIntoTimeSlots(freshAvailability, formattedDate);
        
        // Update time slots first
        setTimeSlots(processedSlots);
        
        // If we have a selected time slot, check if it's still available in the new data
        if (currentSelectedSlot) {
          // Find the matching slot in the new data
          const matchingSlot = processedSlots.find(
            slot => slot.startTime === currentSelectedSlot.startTime
          );
          
          if (matchingSlot && matchingSlot.isAvailable) {
            // The selected slot is still available, update the ID to match the new slot ID
            setSelectedTimeSlot(matchingSlot.id);
            
            // Update form data to ensure it's in sync
            updateFormWithTimeSlot(matchingSlot);
          } else if (!userJustSelectedTimeSlot) {
            // Only show the error if the user didn't just select this time slot
            // The slot is no longer available, show an error
            setAvailabilityError("This time slot is no longer available. Please select another time slot.");
            setSelectedTimeSlot(null);
            
            // Clear the form data
            handleDateTimeChange("classStartDateTime", new Date(0));
            handleDateTimeChange("classEndDateTime", new Date(0));
            
            // Cancel any reservation
            if (cancelReservation) {
              await cancelReservation();
            }
          }
        }
      } else {
        setTimeSlots([]);
        // If no slots are available, clear the selection
        if (selectedTimeSlot) {
          setSelectedTimeSlot(null);
          setAvailabilityError("No time slots available for this date. Please select another date.");
        }
      }
      
      setLastRefreshTime(new Date());
      // Reset the user selection flag after refresh
      setUserJustSelectedTimeSlot(false);
    } catch (error) {
      console.error("Error refreshing availability:", error);
      // Don't clear the selection on error, just show the error message
      setAvailabilityError("Failed to load teacher's availability. Please try again or select a different date.");
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedTeacher, selectedDate, selectedTimeSlot, timeSlots, isRefreshing, processAvailabilityIntoTimeSlots, updateFormWithTimeSlot, handleDateTimeChange, cancelReservation, userJustSelectedTimeSlot, lastRefreshTime]);

  // Handle date selection
  const handleDateSelect = useCallback(async (date: Date | undefined) => {
    if (!date || !selectedTeacher) return;

    // Only update if the date has actually changed
    if (!selectedDate || date.toDateString() !== selectedDate.toDateString()) {
      setSelectedDate(date);
      setSelectedTimeSlot(null); // Reset time slot when date changes
      setIsLoadingTimeSlots(true); // Show loading state immediately
      // Clear any existing error
      setAvailabilityError(null);

      try {
        // Standardize the date to ensure consistent time zone handling
        const standardizedDate = standardizeDate(date);
        
        // We need to set a default time (noon) to avoid time zone issues
        const dateWithDefaultTime = new Date(standardizedDate);
        dateWithDefaultTime.setUTCHours(12, 0, 0, 0);

        // Get the student's timezone for logging
        const studentTimezone = formData.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        console.log(`Selected date: ${format(date, 'yyyy-MM-dd')}`);
        console.log(`  - Original date: ${date.toISOString()}`);
        console.log(`  - Standardized date: ${standardizedDate.toISOString()}`);
        console.log(`  - With default time: ${dateWithDefaultTime.toISOString()}`);
        console.log(`  - Student timezone: ${studentTimezone}`);

        // Update form data with the selected date
        handleDateTimeChange("classStartDateTime", dateWithDefaultTime);
        
        // Cancel any existing reservation when date changes
        if (cancelReservation) {
          await cancelReservation();
        }

        // Fetch availability for the new date
        await fetchAvailabilityForDate(date, selectedTeacher);
      } catch (error) {
        console.error("Error fetching availability for selected date:", error);
        setAvailabilityError("Error fetching availability. Please try again.");
      } finally {
        setIsLoadingTimeSlots(false);
      }
    }
  }, [selectedDate, selectedTeacher, handleDateTimeChange, cancelReservation, fetchAvailabilityForDate, formData.timeZone]);

  // Handle time slot selection
  const handleTimeSlotSelect = useCallback(async (slot: TimeSlot) => {
    if (!slot.isAvailable || !selectedTeacher) return;
    
    try {
      // Set loading state but keep the selection visible
      setIsLoadingTimeSlots(true);
      
      // Set selected time slot ID immediately to provide visual feedback
      setSelectedTimeSlot(slot.id);
      
      // Mark that the user just selected this time slot
      setUserJustSelectedTimeSlot(true);
      
      // Clear any existing error
      setAvailabilityError(null);
      
      // Standardize dates to ensure consistent time zone handling
      const standardizedStartDateTime = standardizeDate(slot.startDateTime);
      const standardizedEndDateTime = standardizeDate(slot.endDateTime);
      
      // Update form data with the selected time slot
      updateFormWithTimeSlot(slot);
      
      // Get the student's timezone for logging
      const studentTimezone = formData.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      console.log(`Selected time slot: ${slot.id}, student local time: ${slot.startTime}-${slot.endTime}`);
      console.log(`  - UTC startDateTime: ${standardizedStartDateTime.toISOString()}`);
      console.log(`  - UTC endDateTime: ${standardizedEndDateTime.toISOString()}`);
      console.log(`  - Student timezone: ${studentTimezone}`);
      
      // Create a temporary reservation if we have a student ID
      if (createReservation && formData.pendingClass?.studentId) {
        try {
          console.log(`Attempting to create reservation for student ${formData.pendingClass.studentId}`);
          console.log(`  - Teacher: ${selectedTeacher}`);
          console.log(`  - UTC start: ${standardizedStartDateTime.toISOString()}`);
          console.log(`  - UTC end: ${standardizedEndDateTime.toISOString()}`);
          console.log(`  - Student local time: ${slot.startTime}-${slot.endTime}`);
          
          const reservationId = await createReservation(
            selectedTeacher,
            standardizedStartDateTime,
            standardizedEndDateTime,
            formData.pendingClass.studentId
          );
          
          if (reservationId) {
            console.log(`Successfully created reservation: ${reservationId}`);
            console.log(`  - Student local time: ${slot.startTime}-${slot.endTime}`);
            console.log(`  - UTC time: ${standardizedStartDateTime.toISOString()} to ${standardizedEndDateTime.toISOString()}`);
          } else {
            console.log('Failed to create reservation, but not showing error to user');
            // Don't refresh availability here - the user just selected this slot
          }
        } catch (error) {
          console.error("Error creating reservation:", error);
          // Don't show an error to the user here - they just selected this slot
          // and we don't want to confuse them
        }
      }
    } catch (error) {
      console.error("Error selecting time slot:", error);
      setAvailabilityError("Error selecting time slot. Please try again.");
    } finally {
      setIsLoadingTimeSlots(false);
    }
  }, [selectedTeacher, updateFormWithTimeSlot, createReservation, formData.pendingClass?.studentId, formData.timeZone]);

  // Effect to refresh availability data periodically
  useEffect(() => {
    // Only set up the interval if we have a teacher and date selected
    if (selectedTeacher && selectedDate && !hasActiveReservation) {
      // Refresh every 30 seconds
      const intervalId = setInterval(() => {
        refreshAvailabilityData();
      }, 30000);
      
      // Clean up the interval when the component unmounts or dependencies change
      return () => clearInterval(intervalId);
    }
  }, [selectedTeacher, selectedDate, isRefreshing, refreshAvailabilityData, hasActiveReservation]);

  // Effect to sync the selected time slot with form data
  useEffect(() => {
    if (selectedTimeSlot && timeSlots.length > 0) {
      const selectedSlot = timeSlots.find(slot => slot.id === selectedTimeSlot);
      
      if (selectedSlot && selectedSlot.isAvailable) {
        // Update form data if needed
        const currentStartTime = formData.classStartDateTime ? 
          formatDateInTimezone(
            formData.classStartDateTime, 
            formData.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone, 
            'HH:mm'
          ) : '';
        
        if (currentStartTime !== selectedSlot.startTime) {
          updateFormWithTimeSlot(selectedSlot);
        }
      }
    }
  }, [selectedTimeSlot, timeSlots, formData.classStartDateTime, updateFormWithTimeSlot, formData.timeZone]);

  return {
    selectedDate,
    selectedTimeSlot,
    timeSlots,
    isLoadingTimeSlots,
    availabilityError,
    isRefreshing,
    lastRefreshTime,
    handleDateSelect,
    handleTimeSlotSelect,
    refreshAvailabilityData,
    fetchAvailabilityForDate,
    setSelectedTimeSlot
  };
} 
