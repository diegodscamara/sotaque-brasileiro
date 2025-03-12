/* eslint-disable no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

// Components
import TeacherSelectionTab from "./teacher-selection/TeacherSelectionTab";
import ScheduleTab from "./teacher-selection/ScheduleTab";
import StepHeader from "./teacher-selection/StepHeader";
import { ErrorDisplay } from "./teacher-selection/ErrorDisplay";
import ReservationIndicator from "./teacher-selection/ReservationIndicator";

// Hooks
import { useTeacherSelection } from "../hooks/useTeacherSelection";
import { useScheduleSelection } from "../hooks/useScheduleSelection";
import { useReservation } from "../hooks/useReservation";
import { useStepValidation } from "../hooks/useStepValidation";

// Types
import { OnboardingFormData } from "../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import TimeSlot interface from ScheduleTab
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

interface Step2TeacherSelectionProps {
  formData: OnboardingFormData;
  errors: Record<string, string | undefined>;
  handleSelectChange: (name: string, value: string) => void;
  handleDateTimeChange: (name: string, value: Date) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setIsStepValid?: (isValid: boolean) => void;
}

/**
 * Step 2 of the onboarding process - Teacher selection and class scheduling
 * @param {Step2TeacherSelectionProps} props - Component props
 * @returns {React.JSX.Element} The teacher selection component
 */
export default function Step2TeacherSelection({
  formData,
  errors,
  handleSelectChange,
  handleDateTimeChange,
  handleInputChange,
  setIsStepValid
}: Step2TeacherSelectionProps): React.JSX.Element {
  const t = useTranslations("student.onboarding");
  const [activeTab, setActiveTab] = useState<string>("teachers");
  
  // Use custom hooks to separate concerns
  const {
    teachers,
    selectedTeacher,
    loading: teachersLoading,
    error: teachersError,
    handleTeacherSelect,
    pendingClass,
    pendingClassLoading
  } = useTeacherSelection(formData, handleSelectChange, handleDateTimeChange);
  
  // Create a stable refresh function using useRef to avoid dependency cycles
  const refreshFnRef = useRef<() => Promise<void>>(async () => {
    console.log("Initial refresh function called - will be replaced");
  });
  
  // Set up reservation hook with the ref function
  const {
    currentReservation,
    reservationExpiry,
    isRefreshing,
    lastRefreshTime,
    createReservation,
    cancelReservation,
    handleRefreshAvailability
  } = useReservation(() => refreshFnRef.current());
  
  // Set up schedule selection hook with reservation functions
  const {
    selectedDate,
    selectedTimeSlot,
    timeSlots,
    isLoadingTimeSlots,
    availabilityError,
    handleDateSelect,
    handleTimeSlotSelect,
    refreshAvailabilityData
  } = useScheduleSelection(
    formData,
    selectedTeacher,
    handleDateTimeChange,
    handleSelectChange,
    createReservation,
    cancelReservation,
    !!currentReservation
  );
  
  // Update the ref with the actual refresh function
  useEffect(() => {
    refreshFnRef.current = refreshAvailabilityData;
  }, [refreshAvailabilityData]);
  
  // Use step validation hook to determine if the step is valid
  const { isStepValid, validateStep } = useStepValidation(
    formData,
    selectedTeacher,
    selectedDate,
    selectedTimeSlot,
    errors
  );
  
  // Update parent component with step validity
  useEffect(() => {
    if (setIsStepValid) {
      setIsStepValid(isStepValid);
    }
  }, [isStepValid, setIsStepValid]);
  
  // Handle restored data from localStorage or database
  const hasRestoredDataRef = useRef(false);

  useEffect(() => {
    const handleRestoredData = async () => {
      // If we've already restored data, don't do it again
      if (hasRestoredDataRef.current) {
        return;
      }
      
      // Mark that we've restored data
      hasRestoredDataRef.current = true;
      
      // If we have a teacher ID from restored data, select it
      if (formData.selectedTeacherId && !selectedTeacher) {
        console.log(`Restoring teacher selection: ${formData.selectedTeacherId}`);
        handleTeacherSelect(formData.selectedTeacherId);
      }
      
      // If we have a class start date from restored data, select it
      if (formData.classStartDateTime && !selectedDate) {
        console.log(`Restoring date selection: ${formData.classStartDateTime}`);
        const date = new Date(formData.classStartDateTime);
        await handleDateSelect(date);
      }
    };
    
    // Only run once when component mounts and not loading
    if (!pendingClassLoading) {
      handleRestoredData();
    }
  }, [
    formData.selectedTeacherId,
    formData.classStartDateTime,
    selectedTeacher,
    selectedDate,
    handleTeacherSelect,
    handleDateSelect,
    pendingClassLoading
  ]);
  
  // Debounce validation to avoid excessive re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      validateStep();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [selectedTeacher, selectedDate, selectedTimeSlot, validateStep]);
  
  // Create wrapper functions to match the expected types
  const handleDateSelectWrapper = useCallback((date: Date | undefined) => {
    if (date) {
      return handleDateSelect(date);
    }
    return Promise.resolve();
  }, [handleDateSelect]);

  const handleTimeSlotSelectWrapper = useCallback((slot: TimeSlot) => {
    return handleTimeSlotSelect(slot.id);
  }, [handleTimeSlotSelect]);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Determine if we should show the schedule tab
  const shouldShowScheduleTab = !!selectedTeacher;
  
  // Determine if we should show the reservation indicator
  const shouldShowReservationIndicator = !!currentReservation && !!reservationExpiry;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
    >
      {/* Step Title and Header */}
      <StepHeader 
        t={t}
        selectedTeacher={selectedTeacher}
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimeSlot}
      />
      
      {/* Display pending class notification if one exists */}
      {pendingClass && !pendingClassLoading && (
        <div className="bg-blue-50 mb-4 p-4 border border-blue-200 rounded-md">
          <h3 className="mb-1 font-medium text-blue-800 text-sm">
            {t("step2.existingPendingClass")}
          </h3>
          <p className="text-blue-700 text-sm">
            {t("step2.pendingClassDescription")}
          </p>
        </div>
      )}
      
      {/* Reservation indicator */}
      {shouldShowReservationIndicator && (
        <ReservationIndicator 
          t={t}
          reservationExpiry={reservationExpiry!}
          refreshAvailabilityData={handleRefreshAvailability}
          isRefreshing={isRefreshing}
          lastRefreshTime={lastRefreshTime}
          timeZone={formData.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone}
        />
      )}

      {/* Error messages */}
      <ErrorDisplay 
        teachersError={teachersError} 
        availabilityError={availabilityError}
        refreshAvailabilityData={refreshAvailabilityData}
        t={t}
      />

      {/* Tabs for the two-step process: 1) Select Teacher, 2) Schedule Class */}
      <Tabs 
        defaultValue="teachers" 
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="teachers" data-testid="teachers-tab">
            {t("step2.tabs.teachers")}
          </TabsTrigger>
          <TabsTrigger 
            value="schedule" 
            disabled={!shouldShowScheduleTab}
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
            loading={teachersLoading}
            errors={errors}
            handleTeacherSelect={(teacherId: string) => {
              handleTeacherSelect(teacherId);
              // Automatically switch to schedule tab when teacher is selected
              setActiveTab("schedule");
            }}
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
            handleDateSelect={handleDateSelectWrapper}
            handleTimeSlotSelect={handleTimeSlotSelectWrapper}
            handleInputChange={handleInputChange}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}