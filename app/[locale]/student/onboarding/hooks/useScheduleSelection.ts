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
    
    // Create a unique key for this date and teacher to prevent duplicate fetches
    const fetchKey = `${teacherId}-${format(date, 'yyyy-MM-dd')}`;
    
    // Check if we've already fetched this data recently (within the last 5 seconds)
    const now = new Date();
    const timeSinceLastFetchMs = now.getTime() - lastRefreshTime.getTime();
    
    if (timeSinceLastFetchMs < 5000 && timeSlots.length > 0) { // 5 seconds and we have data
      console.log(`Skipping fetch - last fetch was less than 5 seconds ago for ${fetchKey}`);
      return;
    }
    
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
              
              try {
                await createReservation(
                  teacherId,
                  standardizedStartDateTime,
                  standardizedEndDateTime,
                  formData.pendingClass.studentId
                );
              } catch (error) {
                console.log("Error creating reservation during data restoration (normal during onboarding):", error);
                // Continue with the process even if reservation creation fails
              }
            } else if (createReservation) {
              console.log("Student ID not available yet (normal during onboarding). Skipping reservation creation.");
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
  }, [formData, restoredDataChecked, processAvailabilityIntoTimeSlots, updateFormWithTimeSlot, createReservation, lastRefreshTime, timeSlots.length]);

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
  }, [
    selectedTeacher, 
    selectedDate, 
    selectedTimeSlot, 
    timeSlots, 
    isRefreshing, 
    processAvailabilityIntoTimeSlots, 
    updateFormWithTimeSlot, 
    handleDateTimeChange, 
    cancelReservation, 
    userJustSelectedTimeSlot, 
    lastRefreshTime
  ]);

  // Function to handle time slot selection
  const handleTimeSlotSelect = useCallback(async (slotId: string) => {
    // If the user selects the same slot, do nothing
    if (slotId === selectedTimeSlot) {
      return;
    }
    
    // Find the selected slot
    const selectedSlot = timeSlots.find(slot => slot.id === slotId);
    
    if (!selectedSlot) {
      console.error(`Time slot with ID ${slotId} not found`);
      return;
    }
    
    // Set the selected time slot
    setSelectedTimeSlot(slotId);
    setUserJustSelectedTimeSlot(true);
    
    // Update form data with the selected time slot
    updateFormWithTimeSlot(selectedSlot);
    
    // If we have a teacher ID and createReservation function, try to create a reservation
    if (selectedTeacher && createReservation) {
      try {
        // Get the student ID from the form data
        const studentId = formData.pendingClass?.studentId;
        
        // During onboarding, the student ID might not be available yet
        // In this case, we'll skip creating a reservation and just update the form data
        if (!studentId) {
          console.log("Student ID not available yet (normal during onboarding). Skipping reservation creation.");
          // We'll still continue with the time slot selection
        } else {
          // Cancel any existing reservation first
          if (cancelReservation && hasActiveReservation) {
            await cancelReservation();
          }
          
          // Create a new reservation
          await createReservation(
            selectedTeacher,
            selectedSlot.startDateTime,
            selectedSlot.endDateTime,
            studentId
          );
        }
      } catch (error) {
        console.error("Error creating reservation:", error);
        // Don't show error to user here, as it's handled in the useReservation hook
      } finally {
        // Reset the user selection flag after a short delay
        setTimeout(() => {
          setUserJustSelectedTimeSlot(false);
        }, 1000);
      }
    }
  }, [
    selectedTimeSlot, 
    timeSlots, 
    updateFormWithTimeSlot, 
    selectedTeacher, 
    createReservation, 
    formData.pendingClass?.studentId,
    cancelReservation,
    hasActiveReservation
  ]);

  // Function to handle date selection
  const handleDateSelect = useCallback(async (date: Date) => {
    // If the user selects the same date, do nothing
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      return;
    }
    
    // Reset selected time slot when date changes
    setSelectedTimeSlot(null);
    
    // Set the selected date
    setSelectedDate(date);
    
    // If we have a teacher ID, fetch availability for the selected date
    if (selectedTeacher) {
      await fetchAvailabilityForDate(date, selectedTeacher);
    }
  }, [selectedDate, selectedTeacher, fetchAvailabilityForDate]);

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
