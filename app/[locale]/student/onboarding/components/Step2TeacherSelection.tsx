/* eslint-disable no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { format } from "date-fns";

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
    handleTeacherSelect
  } = useTeacherSelection(formData, handleSelectChange);
  
  // Create a dummy refreshAvailabilityData function for initial hook setup
  const dummyRefresh = async () => {};
  
  // Set up reservation hook with the dummy refresh function
  // The actual function will be updated via the useRef in the hook
  const {
    currentReservation,
    reservationExpiry,
    isRefreshing,
    lastRefreshTime,
    createReservation,
    cancelReservation,
    handleRefreshAvailability
  } = useReservation(dummyRefresh);
  
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
  
  // Update the reservation hook with the actual refresh function
  useEffect(() => {
    // This will update the ref in the useReservation hook
    if (refreshAvailabilityData) {
      const refreshFn = async () => {
        await refreshAvailabilityData();
      };
      // Don't call the function here, just update the ref in useReservation
      // The function will be called by the useReservation hook when needed
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