/* eslint-disable no-unused-vars */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

// Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StepHeader from "../teacher-selection/StepHeader";
import TeacherSelectionTab from "../teacher-selection/TeacherSelectionTab";
import ScheduleTab from "../teacher-selection/ScheduleTab";
import ErrorDisplay from "../teacher-selection/ErrorDisplay";
import ReservationIndicator from "../teacher-selection/ReservationIndicator";

// Hooks
import { useTeacherSelection } from "../../hooks/useTeacherSelection";
import { useScheduleSelection } from "../../hooks/useScheduleSelection";
import { useReservation } from "../../hooks/useReservation";
import { useStepValidation } from "../../hooks/useStepValidation";

// Types
import { TimeSlot, Step2FormData } from "../../types";

/**
 * Props for the Step2TeacherSelection component
 */
interface Step2TeacherSelectionProps {
  formData: Step2FormData;
  errors: Record<string, string>;
  setIsStepValid?: (isValid: boolean) => void;
  handleInputChange: (name: string, value: any) => void;
  t: ReturnType<typeof useTranslations>;
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
  t
}: Step2TeacherSelectionProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>("teachers");

  // Use custom hooks to separate concerns
  const {
    teachers,
    selectedTeacher,
    isLoadingTeachers: teachersLoading,
    teacherError: teachersError,
    handleTeacherSelect
  } = useTeacherSelection(formData);

  // Create a stable refresh function using useRef to avoid dependency cycles
  const refreshFnRef = useRef<() => Promise<void>>(async () => {});

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
  } = useScheduleSelection(formData);

  // Update the ref with the actual refresh function
  useEffect(() => {
    refreshFnRef.current = refreshAvailabilityData;
  }, [refreshAvailabilityData]);

  // Use step validation hook to determine if the step is valid
  const { errorMessage, validateStep } = useStepValidation();

  // Update parent component with step validity
  useEffect(() => {
    if (setIsStepValid) {
      const isValid = validateStep(formData);
      setIsStepValid(isValid);
    }
  }, [formData, setIsStepValid, validateStep]);

  // Handle restored data from localStorage or database
  const hasRestoredDataRef = useRef(false);

  useEffect(() => {
    const handleRestoredData = async () => {
      if (hasRestoredDataRef.current) return;
      hasRestoredDataRef.current = true;

      if (formData.selectedTeacher?.id && !selectedTeacher) {
        handleTeacherSelect(formData.selectedTeacher);
      }

      if (formData.classStartDateTime && !selectedDate) {
        const date = new Date(formData.classStartDateTime);
        await handleDateSelect(date);
      }
    };

    if (!teachersLoading) {
      handleRestoredData();
    }
  }, [
    formData.selectedTeacher?.id,
    formData.classStartDateTime,
    selectedTeacher,
    selectedDate,
    handleTeacherSelect,
    handleDateSelect,
    teachersLoading
  ]);

  // Debounce validation to avoid excessive re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      validateStep(formData);
    }, 300);

    return () => clearTimeout(timer);
  }, [formData, validateStep]);

  // Create wrapper functions to match the expected types
  const handleDateSelectWrapper = useCallback((date: Date | undefined) => {
    if (date) {
      return handleDateSelect(date);
    }
    return Promise.resolve();
  }, [handleDateSelect]);
  /**
   * Wraps handleTimeSlotSelect to match the expected type signature.
   * @param slot - The selected time slot.
   * @returns A promise that resolves to void.
   */
  const handleTimeSlotSelectWrapper = useCallback((slot: TimeSlot): Promise<void> => {
    return Promise.resolve(handleTimeSlotSelect(slot));
  }, [handleTimeSlotSelect]);

  /**
   * Handles changes to the active tab.
   * @param value - The value of the newly selected tab.
   */
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

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
      {selectedTeacher && !teachersLoading && (
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
          refreshAvailabilityData={handleRefreshAvailability}
          isRefreshing={isRefreshing}
          lastRefreshTime={lastRefreshTime || new Date()}
          timeZone={formData.timeZone}
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
            loading={teachersLoading}
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
            handleDateSelect={handleDateSelectWrapper}
            handleTimeSlotSelect={handleTimeSlotSelectWrapper}
            handleInputChange={handleInputChange}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}