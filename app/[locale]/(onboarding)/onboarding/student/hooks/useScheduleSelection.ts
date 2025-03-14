import { useState, useCallback, useEffect } from "react";
import { TeacherComplete } from "@/types/teacher";
import { Step2FormData, TimeSlot } from "../types";

/**
 * Hook return type for schedule selection
 */
interface UseScheduleSelectionReturn {
  selectedDate: Date | null;
  selectedTimeSlot: TimeSlot | null;
  timeSlots: TimeSlot[];
  isLoadingTimeSlots: boolean;
  availabilityError: string | null;
  handleDateSelect: (date: Date) => Promise<void>;
  handleTimeSlotSelect: (timeSlot: TimeSlot) => void;
  refreshAvailabilityData: () => Promise<void>;
}

/**
 * Custom hook for managing schedule selection
 * @param formData - The form data for step 2
 * @returns {UseScheduleSelectionReturn} The schedule selection state and handlers
 */
export function useScheduleSelection(
  formData: Step2FormData
): UseScheduleSelectionReturn {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Fetch time slots for a given date
  const fetchTimeSlots = useCallback(async (date: Date, teacher: TeacherComplete) => {
    setIsLoadingTimeSlots(true);
    setAvailabilityError(null);

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/availability/${teacher.id}?date=${date.toISOString()}`);
      const data = await response.json();
      
      setTimeSlots(data.timeSlots);
    } catch (err) {
      console.error("Error fetching time slots:", err);
      setAvailabilityError("Failed to load available time slots");
      setTimeSlots([]);
    } finally {
      setIsLoadingTimeSlots(false);
    }
  }, []);

  // Handle date selection
  const handleDateSelect = useCallback(async (date: Date) => {
    if (!formData.selectedTeacher) {
      setAvailabilityError("Please select a teacher first");
      return;
    }

    setSelectedDate(date);
    setSelectedTimeSlot(null);
    await fetchTimeSlots(date, formData.selectedTeacher);
  }, [formData.selectedTeacher, fetchTimeSlots]);

  // Handle time slot selection
  const handleTimeSlotSelect = useCallback((timeSlot: TimeSlot) => {
    if (!timeSlot.isAvailable) {
      setAvailabilityError("This time slot is not available");
      return;
    }

    setSelectedTimeSlot(timeSlot);
    setAvailabilityError(null);
  }, []);

  // Refresh availability data
  const refreshAvailabilityData = useCallback(async () => {
    if (!selectedDate || !formData.selectedTeacher) return;
    await fetchTimeSlots(selectedDate, formData.selectedTeacher);
  }, [selectedDate, formData.selectedTeacher, fetchTimeSlots]);

  // Fetch time slots when teacher or date changes
  useEffect(() => {
    if (selectedDate && formData.selectedTeacher) {
      fetchTimeSlots(selectedDate, formData.selectedTeacher);
    }
  }, [selectedDate, formData.selectedTeacher, fetchTimeSlots]);

  return {
    selectedDate,
    selectedTimeSlot,
    timeSlots,
    isLoadingTimeSlots,
    availabilityError,
    handleDateSelect,
    handleTimeSlotSelect,
    refreshAvailabilityData
  };
} 
