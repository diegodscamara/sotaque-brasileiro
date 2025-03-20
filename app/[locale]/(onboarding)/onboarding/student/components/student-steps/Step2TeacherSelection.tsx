/* eslint-disable no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Components
import StepHeader from "../teacher-selection/StepHeader";
import TeacherSelectionTab from "../teacher-selection/TeacherSelectionTab";
import ScheduleTab from "../teacher-selection/ScheduleTab";

// Types
import { TimeSlot, Step2FormData } from "../../types";
import { TeacherComplete } from "@/types/teacher";

// Hooks
import { useStepValidation } from "../../hooks/useStepValidation";

// Actions
import { getTeachers } from "@/app/actions/teachers";
import { getTeacherAvailability } from "@/app/actions/availability";
import { fetchClasses, cancelPendingClass } from "@/app/actions/classes";

/**
 * Props for the Step2TeacherSelection component
 */
interface Step2TeacherSelectionProps {
  formData: Step2FormData;
  errors: Record<string, string>;
  setIsStepValid?: (isValid: boolean) => void;
  handleInputChange: (name: string, value: any) => void;
  t: ReturnType<typeof useTranslations>;
  onNextClicked?: () => void;
}

/**
 * Step 2 of the onboarding process - Teacher Selection and Scheduling
 * @param {Step2TeacherSelectionProps} props - Component props
 * @returns {React.JSX.Element} The step 2 component
 */
export default function Step2TeacherSelection({
  formData,
  errors,
  setIsStepValid,
  handleInputChange,
  t,
  onNextClicked
}: Step2TeacherSelectionProps): React.JSX.Element {
  // UI state
  const [activeTab, setActiveTab] = useState<string>("teachers");

  // Data state
  const [teachers, setTeachers] = useState<TeacherComplete[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherComplete | null>(formData.selectedTeacher);
  const [selectedDate, setSelectedDate] = useState<Date | null>(formData.selectedDate);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(formData.selectedTimeSlot);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Loading state
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

  // Error state
  const [teachersError, setTeachersError] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Use step validation hook
  const {
    isValid,
    errorMessage,
    validateStep,
    isReadyToAdvance,
    setReadyToAdvance
  } = useStepValidation();

  // Check step validity when data changes
  useEffect(() => {
    // Update internal validation without marking step as ready to advance
    validateStep({
      selectedTeacher,
      selectedDate,
      selectedTimeSlot,
      timeZone: formData.timeZone,
      notes: formData.notes || "",
      studentId: formData.studentId
    });

    // Only update parent's isStepValid if we have all required data
    if (setIsStepValid) {
      setIsStepValid(!!selectedTeacher && !!selectedDate && !!selectedTimeSlot);
    }
  }, [selectedTeacher, selectedDate, selectedTimeSlot, setIsStepValid, formData.timeZone, formData.notes, formData.studentId, validateStep]);

  // Function to fetch teachers with available time slots
  const fetchTeachersWithAvailability = useCallback(async () => {
    setIsLoadingTeachers(true);
    setTeachersError(null);

    try {
      // Get all teachers
      const allTeachers = await getTeachers();

      // Only keep teachers with availability
      const availableTeachers = [];

      for (const teacher of allTeachers) {
        const now = new Date();
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Check if teacher has any availability in the next 30 days
        const availability = await getTeacherAvailability(
          teacher.id,
          now.toISOString()
        );

        if (availability && availability.length > 0) {
          availableTeachers.push(teacher);
        }
      }

      setTeachers(availableTeachers as TeacherComplete[]);

      // If no teachers are available, show an error
      if (availableTeachers.length === 0) {
        setTeachersError(t("step2.errors.noTeachersAvailable"));
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setTeachersError(t("step2.errors.failedToLoadTeachers"));
    } finally {
      setIsLoadingTeachers(false);
    }
  }, [t]);

  // Function to fetch time slots for a given date and teacher
  const fetchTimeSlots = useCallback(async (date: Date, teacherId: string) => {
    setIsLoadingTimeSlots(true);
    setAvailabilityError(null);

    try {
      const availability = await getTeacherAvailability(teacherId, date.toISOString());

      if (!availability || availability.length === 0) {
        setTimeSlots([]);
        return;
      }

      // Map to TimeSlot format
      const slots: TimeSlot[] = availability.map(slot => ({
        id: slot.id,
        startTime: new Date(slot.startDateTime).toLocaleTimeString(),
        endTime: new Date(slot.endDateTime).toLocaleTimeString(),
        startDateTime: new Date(slot.startDateTime),
        endDateTime: new Date(slot.endDateTime),
        displayStartTime: new Date(slot.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        displayEndTime: new Date(slot.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAvailable: slot.isAvailable
      }));

      setTimeSlots(slots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      setAvailabilityError(t("step2.errors.failedToLoadTimeSlots"));
      setTimeSlots([]);
    } finally {
      setIsLoadingTimeSlots(false);
    }
  }, [t]);

  // Function to handle teacher selection
  const handleTeacherSelect = useCallback(async (teacher: TeacherComplete) => {
    setSelectedTeacher(teacher);

    // Update the parent form data
    handleInputChange("selectedTeacher", teacher);

    // Reset selected date and time slot
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    handleInputChange("selectedTimeSlot", null);

    // Move to the schedule tab
    setActiveTab("schedule");
  }, [handleInputChange]);

  // Function to handle date selection
  const handleDateSelect = useCallback(async (date: Date) => {
    if (!selectedTeacher) return;

    setSelectedDate(date);
    setSelectedTimeSlot(null);
    
    // Update the parent form data with the selected date and clear the time slot
    handleInputChange("selectedDate", date);
    handleInputChange("selectedTimeSlot", null);

    // Fetch time slots for the selected date and teacher
    await fetchTimeSlots(date, selectedTeacher.id);
  }, [selectedTeacher, fetchTimeSlots, handleInputChange]);

  // Function to handle time slot selection
  const handleTimeSlotSelect = useCallback(async (slot: TimeSlot) => {
    // Only update local state
    setSelectedTimeSlot(slot);

    // IMPORTANT: Do NOT update parent form data here
    // This would cause automatic advancement
    // handleInputChange("selectedTimeSlot", slot);

    // Update validation state
    validateStep({
      selectedTeacher,
      selectedDate,
      selectedTimeSlot: slot,
      timeZone: formData.timeZone,
      notes: formData.notes || "",
      studentId: formData.studentId
    });

    // Only inform parent that step is valid (enables Next button)
    // but doesn't trigger navigation
    if (setIsStepValid) {
      setIsStepValid(!!selectedTeacher && !!selectedDate && !!slot);
    }
  }, [selectedTeacher, selectedDate, validateStep, formData.timeZone, formData.notes, formData.studentId, setIsStepValid]);

  // Check and clear any pending classes for the student
  useEffect(() => {
    const checkAndClearPendingClasses = async () => {
      if (formData.studentId) {
        try {
          // Check for existing pending classes
          const pendingClasses = await fetchClasses({
            studentId: formData.studentId,
            status: "PENDING"
          });
          
          console.log(`Found ${pendingClasses?.data?.length || 0} pending classes to clean up`);
          
          // Cancel any existing pending classes
          if (pendingClasses?.data?.length > 0) {
            for (const pendingClass of pendingClasses.data) {
              // Cancel the pending class - availability restoration is handled by the server action
              await cancelPendingClass(pendingClass.id);
              console.log(`Cancelled pending class: ${pendingClass.id}`);

              // Refresh the time slots if we're on the same date/teacher
              if (selectedDate && selectedTeacher &&
                  selectedTeacher.id === pendingClass.teacherId &&
                  selectedDate.toDateString() === new Date(pendingClass.startDateTime).toDateString()) {
                await fetchTimeSlots(selectedDate, selectedTeacher.id);
              }
            }

            // Reset UI state after canceling classes
            setSelectedTeacher(null);
            setSelectedDate(null);
            setSelectedTimeSlot(null);
            setActiveTab("teachers");
            handleInputChange("selectedTeacher", null);
            handleInputChange("selectedDate", null);
            handleInputChange("selectedTimeSlot", null);

            // Mark the step as not completed
            if (setIsStepValid) {
              setIsStepValid(false);
            }
          }
        } catch (error) {
          console.error("Error handling pending classes:", error);
        }
      }
    };

    checkAndClearPendingClasses();
  }, []); // Empty dependency array - only run once on mount

  // Initial fetch of teachers when component mounts
  useEffect(() => {
    fetchTeachersWithAvailability();
  }, [fetchTeachersWithAvailability]);

  // Add event listener for parent's "Next" button click
  useEffect(() => {
    const handleUpdateParentData = () => {
      if (selectedTimeSlot) {
        // Update parent component with the selected time slot
        handleInputChange("selectedTimeSlot", selectedTimeSlot);

        // Call the onNextClicked callback if provided
        if (onNextClicked) {
          onNextClicked();
        }
      }
    };

    // Get the step panel element
    const stepPanel = document.getElementById('step-panel-2');
    if (stepPanel) {
      stepPanel.addEventListener('update-parent-data', handleUpdateParentData);
    }

    return () => {
      if (stepPanel) {
        stepPanel.removeEventListener('update-parent-data', handleUpdateParentData);
      }
    };
  }, [selectedTimeSlot, handleInputChange, onNextClicked]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
    >
      {/* Hidden field to store selected time slot data */}
      {selectedTimeSlot && (
        <div
          data-selected-time-slot-data={JSON.stringify({
            ...selectedTimeSlot,
            startDateTime: selectedTimeSlot.startDateTime instanceof Date
              ? selectedTimeSlot.startDateTime.toISOString()
              : new Date(selectedTimeSlot.startDateTime).toISOString(),
            endDateTime: selectedTimeSlot.endDateTime instanceof Date
              ? selectedTimeSlot.endDateTime.toISOString()
              : new Date(selectedTimeSlot.endDateTime).toISOString()
          })}
          className="hidden"
        />
      )}

      {/* Step Title and Header */}
      <StepHeader
        t={t}
        selectedTeacher={selectedTeacher}
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimeSlot}
      />

      {/* Error displays */}
      {teachersError && (
        <div className="bg-red-50 mb-4 p-4 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{teachersError}</p>
        </div>
      )}

      {availabilityError && (
        <div className="bg-red-50 mb-4 p-4 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{availabilityError}</p>
        </div>
      )}

      {/* Tabs for the two-step process: 1) Select Teacher, 2) Schedule Class */}
      <Tabs
        defaultValue="teachers"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="teachers" data-testid="teachers-tab">
            {t("step2.tabs.teachers")}
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            disabled={!selectedTeacher}
            data-testid="schedule-tab"
          >
            {t("step2.tabs.schedule")}
          </TabsTrigger>
        </TabsList>

        {/* Teacher Selection Tab */}
        <TabsContent value="teachers" className="space-y-4">
          <TeacherSelectionTab
            teachers={teachers}
            selectedTeacher={selectedTeacher}
            loading={isLoadingTeachers}
            errors={errors}
            handleTeacherSelect={handleTeacherSelect}
            t={t}
          />
        </TabsContent>

        {/* Schedule Class Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <ScheduleTab
            t={t}
            formData={formData}
            errors={errors}
            selectedTeacher={selectedTeacher}
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            timeSlots={timeSlots}
            isLoadingTimeSlots={isLoadingTimeSlots}
            teachers={teachers}
            handleDateSelect={handleDateSelect}
            handleTimeSlotSelect={handleTimeSlotSelect}
            handleInputChange={handleInputChange}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}