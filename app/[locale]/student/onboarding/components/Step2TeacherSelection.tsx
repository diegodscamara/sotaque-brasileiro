/* eslint-disable no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Calendar, Clock, GraduationCap, Globe, Star } from "@phosphor-icons/react";
import Image from "next/image";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/libs/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

// Types
import { OnboardingFormData } from "../types";

// API
import { getTeachers } from "@/app/actions/teachers";
import { getTeacherAvailabilityRange } from "@/app/actions/availability";

// Mock teachers for testing or when no teachers are available
const mockTeachers = [
  {
    id: "1",
    userId: "user1",
    user: {
      firstName: "Ana",
      lastName: "Silva",
      avatarUrl: "https://i.pravatar.cc/150?img=1",
      email: "ana.silva@example.com"
    },
    biography: "I'm a certified language teacher with 5 years of experience teaching Brazilian Portuguese. I specialize in conversational Portuguese and can help you sound like a native speaker in no time!",
    specialties: ["Conversation", "Pronunciation", "Grammar"],
    languages: ["Portuguese", "English", "Spanish"],
    rating: 4.9,
    reviewCount: 124
  },
  {
    id: "2",
    userId: "user2",
    user: {
      firstName: "Pedro",
      lastName: "Costa",
      avatarUrl: "https://i.pravatar.cc/150?img=3",
      email: "pedro.costa@example.com"
    },
    biography: "Former university professor with 10+ years of experience teaching Portuguese to international students. My approach focuses on practical language skills for everyday situations.",
    specialties: ["Academic Portuguese", "Business Portuguese", "Cultural Context"],
    languages: ["Portuguese", "English", "French"],
    rating: 4.8,
    reviewCount: 98
  },
  {
    id: "3",
    userId: "user3",
    user: {
      firstName: "Camila",
      lastName: "Oliveira",
      avatarUrl: "https://i.pravatar.cc/150?img=5",
      email: "camila.oliveira@example.com"
    },
    biography: "Passionate about Brazilian culture and language. I create personalized lessons based on your interests, whether that's music, literature, or just casual conversation.",
    specialties: ["Brazilian Culture", "Slang & Idioms", "Conversation"],
    languages: ["Portuguese", "English", "Italian"],
    rating: 4.7,
    reviewCount: 87
  }
];

interface Step2TeacherSelectionProps {
  formData: OnboardingFormData;
  errors: Record<string, string>;
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

  // State for the component
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(formData.selectedTeacherId || null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(formData.classStartDateTime || undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("teachers");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch teachers on component mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const teachersData = await getTeachers();

        if (teachersData && teachersData.length > 0) {
          // Add mock rating and review count for now
          const teachersWithRatings = teachersData.map(teacher => ({
            ...teacher,
            rating: (4 + Math.random()).toFixed(1),
            reviewCount: Math.floor(Math.random() * 100) + 50
          }));

          setTeachers(teachersWithRatings);
        } else {
          // If no teachers are found, use mock data as fallback
          console.warn("No teachers found in the database. Using mock data instead.");
          setTeachers(mockTeachers);
          setError("No teachers found in the database. Using sample teachers instead.");
          
          // Auto-clear error after 5 seconds
          setTimeout(() => {
            setError(null);
          }, 5000);
        }
      } catch (err) {
        console.error("Error fetching teachers:", err);
        setError("Failed to load teachers. Using mock data instead.");
        
        // Use mock data as fallback
        setTeachers(mockTeachers);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Fetch availability when a teacher and date are selected
  useEffect(() => {
    // Clear time slots when teacher changes to avoid showing previous teacher's slots
    if (selectedTeacher && !selectedDate) {
      setTimeSlots([]);
      return;
    }

    // Skip if we don't have both teacher and date
    if (!selectedTeacher || !selectedDate) return;

    // Create a flag to track if the component is still mounted
    let isMounted = true;

    const fetchAvailability = async () => {
      try {
        setLoading(true);

        // Format date for API
        const dateStr = selectedDate.toISOString().split('T')[0];

        // Get next day for range
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];

        // Fetch availability from API
        const availability = await getTeacherAvailabilityRange(
          selectedTeacher,
          dateStr,
          nextDayStr
        );

        // Only update state if component is still mounted
        if (!isMounted) return;

        if (availability && availability.length > 0) {
          // Convert availability to time slots
          const slots = availability.map(slot => ({
            id: slot.id,
            startTime: new Date(slot.startDateTime),
            endTime: new Date(slot.endDateTime),
            available: slot.isAvailable
          }));

          setTimeSlots(slots);
          console.log(`Found ${slots.length} availability slots for teacher ${selectedTeacher} on ${dateStr}`);
        } else {
          console.log(`No availability found for teacher ${selectedTeacher} on ${dateStr}.`);
          setTimeSlots([]);
          setError(t("step2.schedule.noAvailability"));
          
          // Auto-clear error after 5 seconds
          setTimeout(() => {
            if (isMounted) setError(null);
          }, 5000);
        }
      } catch (err) {
        // Only update state if component is still mounted
        if (!isMounted) return;

        console.error(`Error fetching availability for teacher ${selectedTeacher}:`, err);
        setTimeSlots([]);
        setError(t("step2.schedule.availabilityError"));

        // Auto-clear error after 5 seconds
        setTimeout(() => {
          if (isMounted) setError(null);
        }, 5000);
      } finally {
        // Only update state if component is still mounted
        if (isMounted) setLoading(false);
      }
    };

    fetchAvailability();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [selectedTeacher, selectedDate, t]);

  // Effect to update form data when selections change
  useEffect(() => {
    if (selectedTeacher && formData.selectedTeacherId !== selectedTeacher) {
      handleSelectChange("selectedTeacherId", selectedTeacher);
    }
  }, [selectedTeacher, handleSelectChange, formData.selectedTeacherId]);

  // Effect to update form data when time slot changes
  useEffect(() => {
    if (!selectedTimeSlot || timeSlots.length === 0) return;
    
    console.log("Time slot effect running with selectedTimeSlot:", selectedTimeSlot);
    
    // Find the selected time slot in the array
    const slot = timeSlots.find((s) => s.id === selectedTimeSlot);
    
    if (slot) {
      console.log("Effect updating form data with slot:", slot.id);
      
      // Update form data with the selected time slot
      // We're now doing this directly in the handleTimeSlotSelect function
      // This is just a backup to ensure the data is consistent
      handleDateTimeChange("classStartDateTime", slot.startTime);
      handleDateTimeChange("classEndDateTime", slot.endTime);

      // Calculate duration in minutes
      const durationMs = slot.endTime.getTime() - slot.startTime.getTime();
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      handleSelectChange("classDuration", durationMinutes.toString());
    } else {
      console.warn("Selected time slot not found in timeSlots array:", selectedTimeSlot);
    }
  }, [selectedTimeSlot, timeSlots]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log("State updated - selectedTimeSlot:", selectedTimeSlot);
    console.log("State updated - timeSlots count:", timeSlots.length);
  }, [selectedTimeSlot, timeSlots]);

  // Reset selected time slot when teacher changes
  useEffect(() => {
    // Only run this effect when selectedTeacher changes, not on every render
    if (!selectedTeacher || !formData.classStartDateTime) return;
    
    // Get previous teacher ID to check if it actually changed
    const prevTeacherId = formData.selectedTeacherId;
    
    // Only reset time slot if the teacher actually changed
    if (prevTeacherId && prevTeacherId !== selectedTeacher) {
      console.log("Teacher changed, resetting time slot");
      
      // Clear selected time slot when teacher changes
      setSelectedTimeSlot(null);
  
      // Reset class date/time in form data when teacher changes
      // Add a check to prevent unnecessary updates
      const isEmptyDate = formData.classStartDateTime.getTime() === 0;
      if (!isEmptyDate) {
        handleDateTimeChange("classStartDateTime", new Date(0));
        if (formData.classEndDateTime) {
          handleDateTimeChange("classEndDateTime", new Date(0));
        }
      }
    }
  }, [selectedTeacher, formData.classStartDateTime, formData.selectedTeacherId]);

  // Handle teacher selection
  const handleTeacherSelect = (teacherId: string) => {
    if (teacherId !== selectedTeacher) {
      setLoading(true); // Set loading state when switching teachers
      setSelectedTeacher(teacherId);
      setActiveTab("schedule");

      // Reset loading state after a short delay if no date is selected yet
      if (!selectedDate) {
        setTimeout(() => setLoading(false), 500);
      }
    } else {
      // If clicking on already selected teacher, just switch to schedule tab
      setActiveTab("schedule");
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Only update if the date has actually changed
    if (!selectedDate || date.toDateString() !== selectedDate.toDateString()) {
      console.log("Date changed, resetting time slot");
      setSelectedDate(date);
      
      // Reset time slot only when date changes
      setSelectedTimeSlot(null);
      
      // We need to set a default time (noon) to avoid time zone issues
      const dateWithDefaultTime = new Date(date);
      dateWithDefaultTime.setHours(12, 0, 0, 0);
      
      // We'll update the actual time when a time slot is selected
      // This is just to track that a date was selected
      handleDateTimeChange("classStartDateTime", dateWithDefaultTime);
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slot: any) => {
    if (!slot.available) return;
    
    console.log("Time slot selected:", slot.id, format(slot.startTime, "h:mm a"), format(slot.endTime, "h:mm a"));
    console.log("Previous selectedTimeSlot:", selectedTimeSlot);
    
    // Just update the selected time slot ID
    setSelectedTimeSlot(slot.id);
    
    // Force update the form data immediately to ensure it's set
    const durationMs = slot.endTime.getTime() - slot.startTime.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));
    
    // Update form data directly in addition to the useEffect
    handleDateTimeChange("classStartDateTime", slot.startTime);
    handleDateTimeChange("classEndDateTime", slot.endTime);
    handleSelectChange("classDuration", durationMinutes.toString());
  };

  // Check if all required selections are made
  const checkStepValidity = useCallback(() => {
    const hasTeacher = !!selectedTeacher;
    const hasDate = !!selectedDate;
    const hasTimeSlot = !!selectedTimeSlot;
    
    return hasTeacher && hasDate && hasTimeSlot;
  }, [selectedTeacher, selectedDate, selectedTimeSlot]);

  // Effect to update step validity whenever selections change
  useEffect(() => {
    // Only update parent component if the setIsStepValid prop is provided
    if (setIsStepValid) {
      const isValid = checkStepValidity();
      setIsStepValid(isValid);
    }
  }, [checkStepValidity, setIsStepValid]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
    >
      {/* Step Title */}
      <div className="mb-6">
        <h1 className="font-semibold text-2xl">{t("step2.title")}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t("step2.subtitle")}</p>
        
        {/* Required selections indicator */}
        <div className="mt-3 text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            {t("step2.requiredSelections", { default: "Required selections" })}:
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
              selectedTeacher ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            }`}>
              {selectedTeacher ? "✓" : "○"} {t("step2.tabs.teachers")}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
              selectedDate ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            }`}>
              {selectedDate ? "✓" : "○"} {t("step2.schedule.selectDate")}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
              selectedTimeSlot ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            }`}>
              {selectedTimeSlot ? "✓" : "○"} {t("step2.schedule.selectTime")}
            </span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-yellow-50 mb-4 p-3 border border-yellow-200 rounded-md text-yellow-800" role="alert">
          {error}
        </div>
      )}

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
          {loading ? (
            // Loading skeleton
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="rounded-full w-16 h-16" />
                      <div className="space-y-2">
                        <Skeleton className="w-24 h-4" />
                        <Skeleton className="w-16 h-3" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Skeleton className="mb-2 w-full h-3" />
                    <Skeleton className="mb-2 w-full h-3" />
                    <Skeleton className="mb-4 w-3/4 h-3" />
                    <div className="space-y-3">
                      <Skeleton className="w-full h-3" />
                      <Skeleton className="w-full h-3" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="w-full h-9" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {teachers.map((teacher) => (
                <Card
                  key={teacher.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-green-500 justify-between",
                    selectedTeacher === teacher.id ? "border-2 border-green-500" : ""
                  )}
                  onClick={() => handleTeacherSelect(teacher.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-4">
                      <div className="relative rounded-full w-16 h-16 overflow-hidden">
                        <Image
                          src={teacher.user.avatarUrl || "https://i.pravatar.cc/150"}
                          alt={`${teacher.user.firstName} ${teacher.user.lastName}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {teacher.user.firstName} {teacher.user.lastName}
                        </CardTitle>
                        <div className="flex items-center mt-1">
                          <Star className="mr-1 w-4 h-4 text-yellow-500" weight="fill" />
                          <span className="font-medium text-sm">{teacher.rating}</span>
                          <span className="ml-1 text-gray-500 text-xs">({teacher.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="mb-3 text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                      {teacher.biography}
                    </p>

                    <div className="flex items-center mb-2">
                      <GraduationCap className="mr-2 w-4 h-4 text-gray-500" />
                      <div className="flex flex-wrap gap-1">
                        {teacher.specialties.map((specialty: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Globe className="mr-2 w-4 h-4 text-gray-500" />
                      <div className="flex flex-wrap gap-1">
                        {teacher.languages.map((language: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant={selectedTeacher === teacher.id ? "default" : "outline"}
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTeacherSelect(teacher.id);
                      }}
                    >
                      {selectedTeacher === teacher.id ? t("step2.teacherSelected") : t("step2.selectTeacher")}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {errors.selectedTeacherId && (
            <div className="mt-1 text-red-500 text-sm" role="alert">
              {errors.selectedTeacherId}
            </div>
          )}
        </TabsContent>

        {/* Schedule Class Tab */}
        <TabsContent value="schedule">
          {selectedTeacher && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="mb-4 font-medium">{t("step2.schedule.title")}</h3>

                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                  {/* Calendar for date selection */}
                  <div>
                    <h4 className="flex items-center mb-2 font-medium text-sm">
                      <Calendar className="mr-2 w-4 h-4" />
                      {t("step2.schedule.selectDate")}
                    </h4>
                    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) =>
                          date < new Date() || // Can't select dates in the past
                          date.getDay() === 0 || // Can't select Sundays
                          date > new Date(new Date().setDate(new Date().getDate() + 30)) // Can't select dates more than 30 days in the future
                        }
                        className="border rounded-md"
                      />
                    </div>

                    {errors.classStartDateTime && (
                      <div className="mt-1 text-red-500 text-sm" role="alert">
                        {errors.classStartDateTime}
                      </div>
                    )}
                  </div>

                  {/* Time slots */}
                  <div>
                    <h4 className="flex items-center mb-2 font-medium text-sm">
                      <Clock className="mr-2 w-4 h-4" />
                      {t("step2.schedule.selectTime")}
                    </h4>

                    {selectedDate ? (
                      <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg h-[300px] overflow-y-auto">
                        {loading ? (
                          // Loading state for time slots
                          <div className="flex flex-col justify-center items-center h-full">
                            <div className="mb-2 border-green-500 border-b-2 rounded-full w-8 h-8 animate-spin"></div>
                            <p className="text-gray-500 text-sm">{t("step2.schedule.loadingTimeSlots")}</p>
                          </div>
                        ) : (
                          <div 
                            role="radiogroup" 
                            aria-label={t("step2.schedule.selectTime")}
                            className="gap-2 grid grid-cols-2"
                          >
                            {timeSlots.map((slot) => (
                              <div key={slot.id} className="mb-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (slot.available) {
                                      console.log("Clicking time slot:", slot.id);
                                      handleTimeSlotSelect(slot);
                                    }
                                  }}
                                  disabled={!slot.available}
                                  aria-checked={selectedTimeSlot === slot.id}
                                  aria-label={`Select time slot at ${format(slot.startTime, "h:mm a")}`}
                                  role="radio"
                                  className={cn(
                                    "w-full flex flex-col items-center justify-center rounded-md border-2 p-2",
                                    "transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                                    selectedTimeSlot === slot.id 
                                      ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                                      : "border-muted bg-popover",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    !slot.available ? "cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-800" : "cursor-pointer"
                                  )}
                                >
                                  <span className="font-medium text-sm">
                                    {format(slot.startTime, "h:mm a")}
                                  </span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {!loading && timeSlots.length === 0 && (
                          <div className="py-8 text-gray-500 text-center">
                            {t("step2.schedule.noTimeSlotsAvailable")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-center items-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg h-[300px]">
                        <p className="text-gray-500 text-center">
                          {t("step2.schedule.selectDateFirst")}
                        </p>
                      </div>
                    )}

                    {errors.classStartDateTime && !errors.selectedDate && (
                      <div className="mt-1 text-red-500 text-sm" role="alert">
                        {errors.classStartDateTime}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Class Notes */}
              <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="mb-4 font-medium">{t("step2.notes.title")}</h3>
                <Textarea
                  name="classNotes"
                  placeholder={t("step2.notes.placeholder")}
                  value={formData.classNotes || ""}
                  onChange={handleInputChange}
                  className="min-h-[100px]"
                />
              </div>

              {/* Selected Teacher Summary */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="mb-4 font-medium">{t("step2.summary.title")}</h3>

                {selectedTeacher && (
                  <div className="flex items-start space-x-4">
                    {(() => {
                      const teacher = teachers.find(t => t.id === selectedTeacher);
                      if (!teacher) return null;

                      return (
                        <>
                          <div className="relative flex-shrink-0 rounded-full w-12 h-12 overflow-hidden">
                            <Image
                              src={teacher.user.avatarUrl || "https://i.pravatar.cc/150"}
                              alt={`${teacher.user.firstName} ${teacher.user.lastName}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {teacher.user.firstName} {teacher.user.lastName}
                            </h4>
                            <div className="flex items-center mt-1 mb-2">
                              <Star className="mr-1 w-4 h-4 text-yellow-500" weight="fill" />
                              <span className="text-sm">{teacher.rating}</span>
                            </div>
                            
                            {/* Date information */}
                            {selectedDate && (
                              <div className="text-gray-600 dark:text-gray-300 text-sm">
                                <div className="flex items-center">
                                  <Calendar className="mr-2 w-4 h-4" />
                                  <span>{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                                </div>
                                
                                {/* Time slot information */}
                                {selectedTimeSlot ? (
                                  <div className="flex items-center mt-1">
                                    <Clock className="mr-2 w-4 h-4" />
                                    {(() => {
                                      console.log("Looking for time slot:", selectedTimeSlot);
                                      console.log("Available time slots:", timeSlots.map(s => s.id));
                                      
                                      const slot = timeSlots.find(s => s.id === selectedTimeSlot);
                                      if (!slot) {
                                        console.log("Time slot not found in timeSlots array");
                                        return <span>{t("step2.schedule.timeSlotNotFound")}</span>;
                                      }
                                      
                                      // Calculate duration in minutes
                                      const durationMs = slot.endTime.getTime() - slot.startTime.getTime();
                                      const durationMinutes = Math.round(durationMs / (1000 * 60));
                                      
                                      return (
                                        <>
                                          <span>
                                            {format(slot.startTime, "h:mm a")} - {format(slot.endTime, "h:mm a")}
                                          </span>
                                          <div className="flex items-center mt-1">
                                            <span className="ml-6 text-gray-500 text-xs">
                                              {t("step2.summary.minutes", { duration: durationMinutes })}
                                            </span>
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                ) : (
                                  <div className="flex items-center mt-1 text-amber-600">
                                    <Clock className="mr-2 w-4 h-4" />
                                    <span>{t("step2.schedule.selectTime")}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Show message if no date is selected */}
                            {!selectedDate && (
                              <div className="flex items-center text-amber-600 text-sm">
                                <Calendar className="mr-2 w-4 h-4" />
                                <span>{t("step2.schedule.selectDate")}</span>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Validation Summary */}
      <div className={`mt-6 p-4 rounded-lg border ${
        checkStepValidity() 
          ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300" 
          : "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300"
      }`}>
        <div className="flex items-center">
          {checkStepValidity() ? (
            <>
              <div className="flex-shrink-0 mr-3">
                <div className="flex justify-center items-center bg-green-100 dark:bg-green-800 rounded-full w-8 h-8">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-medium">{t("step2.validationComplete", { default: "All selections complete" })}</h3>
                <p className="mt-1 text-sm">{t("step2.readyForNextStep", { default: "You're ready to proceed to the next step" })}</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex-shrink-0 mr-3">
                <div className="flex justify-center items-center bg-amber-100 dark:bg-amber-800 rounded-full w-8 h-8">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-medium">{t("step2.validationIncomplete")}</h3>
                <p className="mt-1 text-sm">{t("step2.completeAllSelections")}</p>
                <ul className="mt-2 text-sm list-disc list-inside">
                  {!selectedTeacher && <li>{t("step2.selectTeacherRequired")}</li>}
                  {!selectedDate && <li>{t("step2.selectDateRequired")}</li>}
                  {!selectedTimeSlot && <li>{t("step2.selectTimeRequired")}</li>}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
} 