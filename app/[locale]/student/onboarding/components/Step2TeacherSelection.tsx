/* eslint-disable no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

// Components
import TeacherSelectionTab from "./teacher-selection/TeacherSelectionTab";
import ScheduleTab from "./teacher-selection/ScheduleTab";
import ValidationSummary from "./teacher-selection/ValidationSummary";
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
    refreshAvailabilityData,
    fetchAvailabilityForDate
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
    if (refreshAvailabilityData) {
      refreshFnRef.current = refreshAvailabilityData;
    }
  }, [refreshAvailabilityData]);
  
  // Validate the step
  const { isStepValid, validateStep } = useStepValidation(
    selectedTeacher,
    selectedDate,
    selectedTimeSlot,
    formData,
    setIsStepValid
  );
  
  // Effect to handle restored data from localStorage
  useEffect(() => {
    const handleRestoredData = async () => {
      // Only use the formData if it's from a valid source (not from browser cache of a different user)
      // This is determined by the parent component's logic that only sets formData.selectedTeacherId
      // if it's from the database or valid localStorage data
      if (formData.selectedTeacherId && !selectedTeacher) {
        console.log("Restoring teacher selection from saved data");
        handleTeacherSelect(formData.selectedTeacherId);
        
        if (formData.classStartDateTime && formData.classEndDateTime) {
          await fetchAvailabilityForDate(formData.classStartDateTime, formData.selectedTeacherId);
        }
      }
      
      validateStep();
    };

    handleRestoredData();
  }, [formData.selectedTeacherId, formData.classStartDateTime, formData.classEndDateTime]);
  
  // Effect to ensure selected time slot is properly reflected in the UI and form data
  useEffect(() => {
    validateStep();
  }, [selectedTimeSlot, timeSlots, validateStep]);

  useEffect(() => {
    // Validate the step whenever relevant data changes
    const isValid = selectedTeacher && 
                    formData.classStartDateTime && 
                    formData.classEndDateTime;
    
    if (setIsStepValid) {
      setIsStepValid(!!isValid);
    }
    
    // If we have a pending class, show a notification or highlight
    if (pendingClass && !pendingClassLoading) {
      // Switch to the schedule tab if we have a pending class
      setActiveTab("schedule");
    }
  }, [selectedTeacher, formData.classStartDateTime, formData.classEndDateTime, setIsStepValid, pendingClass, pendingClassLoading]);

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
      {currentReservation && reservationExpiry && (
        <ReservationIndicator
          t={t}
          reservationExpiry={reservationExpiry}
          isRefreshing={isRefreshing}
          lastRefreshTime={lastRefreshTime}
          refreshAvailabilityData={refreshAvailabilityData}
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 w-full">
          <TabsTrigger value="teachers" disabled={false}>
            {t("step2.tabs.teachers")}
          </TabsTrigger>
          <TabsTrigger value="schedule" disabled={!selectedTeacher}>
            {t("step2.tabs.schedule")}
          </TabsTrigger>
        </TabsList>

        {/* Teacher Selection Tab */}
        <TabsContent value="teachers" className="space-y-4">
          <TeacherSelectionTab
            teachers={teachers}
            selectedTeacher={selectedTeacher}
            loading={teachersLoading}
            handleTeacherSelect={(teacherId) => {
              handleTeacherSelect(teacherId);
              setActiveTab("schedule");
            }}
            errors={errors}
            t={t}
          />
        </TabsContent>

        {/* Schedule Class Tab */}
        <TabsContent value="schedule">
          {selectedTeacher && (
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
          )}
        </TabsContent>
      </Tabs>

      {/* Validation Summary */}
      <ValidationSummary 
        isStepValid={isStepValid}
        selectedTeacher={selectedTeacher}
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimeSlot}
        t={t}
      />
    </motion.div>
  );
}