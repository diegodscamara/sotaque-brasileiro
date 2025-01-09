"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { addBusinessDays, addDays, getDay, setHours } from "date-fns";
import { useEffect, useState } from "react";

import BookingTypeDropdown from "./class-modal/BookingTypeDropdown";
import { Button } from "../ui/button";
import { Class } from "@/types/class";
import DateTimeSection from "./class-modal/DateTimeSection";
import NotesSection from "./class-modal/NotesSection";
import RecurringEditDialog from "./class-modal/RecurringEditDialog";
import { RecurringOptions } from "./class-modal/RecurringOptions";
import SummarySection from "./class-modal/SummarySection";
import TitleSection from "./class-modal/TitleSection";
import { X } from "@phosphor-icons/react";
import { cancelClass } from "@/libs/utils/classActions";
import { createClient } from "@/libs/supabase/client";
import { isDateBookable } from "@/libs/utils/date";
import { toast } from "react-hot-toast";

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition

const getUserTimeZone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

type BookingType = 'single' | 'multiple' | 'recurring';

interface RecurringConfig {
  pattern: 'weekly';
  daysOfWeek: number[];
  occurrences: number;
  endType: 'after' | 'on';
  endDate?: Date;
}

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  selectedClass?: Class;
  onClassUpdated: () => void;
}

interface SummarySectionProps {
  selectedClass?: Class;
  getClassDates: () => Date[];
  availableCredits: number;
  isSubmitting: boolean;
  onCancel?: () => void;
  onClose: () => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const ClassModal = ({
  isOpen,
  onClose,
  selectedDate: defaultDate,
  selectedClass,
  onClassUpdated
}: ClassModalProps) => {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(defaultDate);
  const [bookingType, setBookingType] = useState<BookingType>('single');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [userTimeZone, setUserTimeZone] = useState<string>('');
  const [recurringConfig, setRecurringConfig] = useState<RecurringConfig>({
    pattern: 'weekly',
    daysOfWeek: [],
    occurrences: 1,
    endType: 'after'
  });
  const [availableCredits, setAvailableCredits] = useState(0);
  const [showRecurringEditDialog, setShowRecurringEditDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [futureLessons, setFutureLessons] = useState<Class[]>([]);

  const [formData, setFormData] = useState(() => {
    let startTime: Date;

    if (selectedClass?.start_time) {
      startTime = new Date(selectedClass.start_time);
    } else if (defaultDate) {
      startTime = new Date(defaultDate);
      startTime.setHours(9, 0, 0, 0);
    } else {
      startTime = new Date();
      startTime.setHours(9, 0, 0, 0);
    }

    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    return {
      title: selectedClass?.title || "Portuguese Class",
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      notes: selectedClass?.notes || "",
      time_zone: '',
    };
  });

  useEffect(() => {
    const timeZone = getUserTimeZone();
    setUserTimeZone(timeZone);

    setFormData(prev => ({
      ...prev,
      time_zone: timeZone
    }));
  }, []);

  // Fetch available credits
  useEffect(() => {
    const fetchCredits = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("students")
          .select("credits")
          .eq("id", user.id)
          .single();

        setAvailableCredits(profile?.credits || 0);
      }
    };
    fetchCredits();
  }, [selectedClass]);

  // Fetch user's time zone from the database
  useEffect(() => {
    const fetchUserTimeZone = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("students")
          .select("time_zone")
          .eq("id", user.id)
          .single();

        setUserTimeZone(profile?.time_zone || '');
      }
    };
    fetchUserTimeZone();
  }, []);

  // Calculate class dates based on booking type
  const getClassDates = (): Date[] => {
    if (!selectedDate) return [];

    const startTime = new Date(formData.start_time);
    const hours = startTime.getHours();
    const minutes = startTime.getMinutes();

    if (bookingType === 'single') {
      const date = new Date(selectedDate);
      date.setHours(hours, minutes, 0, 0);
      return [date];
    }

    if (bookingType === 'multiple') {
      return selectedDates.map(date => {
        const newDate = new Date(date);
        newDate.setHours(hours, minutes, 0, 0);
        return newDate;
      });
    }

    if (bookingType === 'recurring' && recurringConfig.daysOfWeek.length > 0) {
      const dates: Date[] = [];
      let currentDate = new Date(selectedDate);
      let count = 0;
      let maxDays = 365; // Safety limit to prevent infinite loops

      // Ensure we start from the selected date
      currentDate.setHours(hours, minutes, 0, 0);

      while (count < recurringConfig.occurrences && maxDays > 0) {
        const dayOfWeek = getDay(currentDate);
        if (recurringConfig.daysOfWeek.includes(dayOfWeek)) {
          dates.push(new Date(currentDate));
          count++;
        }
        currentDate = addDays(currentDate, 1);
        maxDays--;
      }

      return dates;
    }

    return [];
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Check if the selected date is bookable
    const startTime = new Date(formData.start_time);
    if (!isDateBookable(startTime)) {
      toast.error("Classes must be scheduled at least 24 business hours in advance");
      return;
    }

    if (selectedClass?.recurring_group_id) {
      setShowRecurringEditDialog(true);
      return;
    }

    await submitChanges('single');
  };

  const submitChanges = async (editType: 'single' | 'all') => {
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to schedule classes");
        return;
      }

      if (selectedClass) {
        // Update existing class
        if (editType === 'single') {
          // Check if the new date is bookable
          const startTime = new Date(formData.start_time);
          if (!isDateBookable(startTime)) {
            toast.error("Classes must be scheduled at least 24 business hours in advance");
            return;
          }

          const { error: updateError } = await supabase
            .from("classes")
            .update({
              title: formData.title,
              start_time: formData.start_time,
              end_time: formData.end_time,
              notes: formData.notes,
              time_zone: formData.time_zone,
              updated_at: new Date().toISOString(),
            })
            .eq("id", selectedClass.id);

          if (updateError) throw updateError;
        } else {
          // Update all recurring events
          const { error: updateError } = await supabase
            .from("classes")
            .update({
              title: formData.title,
              notes: formData.notes,
              time_zone: formData.time_zone,
              updated_at: new Date().toISOString(),
            })
            .eq("recurring_group_id", selectedClass.recurring_group_id)
            .gte("start_time", new Date().toISOString()); // Only update future events

          if (updateError) throw updateError;
        }
        toast.success(editType === 'single' ? "Class updated successfully" : "All recurring classes updated successfully");
      } else {
        // Create new class(es)
        const classDates = getClassDates();
        if (classDates.length === 0) {
          toast.error("Please select at least one class date");
          return;
        }

        // Check if all selected dates are bookable
        const unbookableDates = classDates.filter(date => !isDateBookable(date));
        if (unbookableDates.length > 0) {
          toast.error("Some selected dates are within 24 business hours. Please select different dates.");
          return;
        }

        // Each class costs 1 credit
        const creditsCost = classDates.length;

        if (availableCredits < creditsCost) {
          toast.error(`You don't have enough credits (${creditsCost} needed, ${availableCredits} available)`);
          return;
        }

        // Generate a recurring group ID if it's a recurring booking
        const recurringGroupId = bookingType === 'recurring' ? crypto.randomUUID() : null;

        const classesToCreate = classDates.map(date => {
          const startTime = new Date(date);
          const endTime = new Date(startTime);
          endTime.setHours(endTime.getHours() + 1);

          return {
            student_id: user.id,
            title: formData.title,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            notes: formData.notes,
            status: "scheduled",
            type: "private",
            credits_cost: 1, // Each class costs 1 credit
            recurring_group_id: recurringGroupId,
            time_zone: userTimeZone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        });

        // Insert the new classes into the database
        const { error: insertError } = await supabase
          .from("classes")
          .insert(classesToCreate);

        if (insertError) throw insertError;

        toast.success(`${classDates.length} class${classDates.length > 1 ? 'es' : ''} scheduled successfully`);
      }

      onClassUpdated();
      onClose();
    } catch (error) {
      console.error("Error scheduling classes:", error);
      toast.error("Failed to schedule classes: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
      setShowRecurringEditDialog(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedClass) {
      console.error("No class selected to cancel");
      return;
    }

    setIsSubmitting(true);
    
    let shouldShowDialog = false;
    try {
      shouldShowDialog = await cancelClass('single', selectedClass);
      console.log("shouldShowDialog after cancelClass:", shouldShowDialog);
    } catch (error) {
      console.error("Error in cancelClass:", error);
    }
    
    setIsSubmitting(false);

    if (shouldShowDialog) {
      setShowCancelDialog(true);
      console.log("showCancelDialog after setting to true:", showCancelDialog);
    } else {
      toast.success("Class cancelled successfully");
      onClassUpdated();
      onClose();
    }
  };

  const handleTimeSelect = (startTime: string, endTime: string) => {
    if (!selectedDate) {
      toast.error("Please select a date first");
      return;
    }

    const [hours, minutes] = startTime.split(':');
    const newStartTime = new Date(selectedDate);
    newStartTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const newEndTime = new Date(newStartTime);
    newEndTime.setHours(newEndTime.getHours() + 1);

    setFormData({
      ...formData,
      start_time: newStartTime.toISOString(),
      end_time: newEndTime.toISOString(),
    });
  };

  const resetModal = () => {
    setSelectedDate(undefined);
    setBookingType('single');
    setSelectedDates([]);
    setRecurringConfig({
      pattern: 'weekly',
      daysOfWeek: [],
      occurrences: 1,
      endType: 'after'
    });

    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(10, 0, 0, 0);

    setFormData({
      title: "Portuguese Class",
      start_time: startTime instanceof Date ? startTime.toISOString() : "",
      end_time: endTime instanceof Date ? endTime.toISOString() : "",
      notes: "",
      time_zone: '',
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Update form data when selectedDate or selectedClass change
  useEffect(() => {
    if (selectedClass) {
      // Initialize with existing class data
      const classStartTime = new Date(selectedClass.start_time);
      setSelectedDate(classStartTime);
      setFormData({
        title: selectedClass.title,
        start_time: selectedClass.start_time,
        end_time: selectedClass.end_time,
        notes: selectedClass.notes || "",
        time_zone: selectedClass.time_zone,
      });
    } else {
      // Initialize for new booking
      setSelectedDate(defaultDate);
      setBookingType('single');
      setSelectedDates([]);
      setRecurringConfig({
        pattern: 'weekly',
        daysOfWeek: [],
        occurrences: 1,
        endType: 'after'
      });

      const startTime = new Date(defaultDate);
      startTime.setHours(9, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      setFormData({
        title: "Portuguese Class",
        start_time: startTime instanceof Date ? startTime.toISOString() : "",
        end_time: endTime instanceof Date ? endTime.toISOString() : "",
        notes: "",
        time_zone: '',
      });
    }
  }, [defaultDate, selectedClass]);

  // Calculate the earliest allowed date for scheduling (24 business hours from now)
  const now = new Date();
  const earliestDate = setHours(addBusinessDays(now, 1), 9);

  if (!isOpen) return null;

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''}`} onClick={(e) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    }}>
      <div className="relative bg-white shadow-xl rounded-md w-full max-w-2xl h-[90%] max-h-fit overflow-hidden" >
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-200 p-4 text-primary-content text">
          <h2 className="font-medium text-lg">
            {selectedClass?.status === 'completed' || selectedClass?.status === 'cancelled' ? "Class Details" : selectedClass ? "Edit Class" : "Schedule Classes"}
          </h2>
          <Button onClick={handleClose} className="rounded-full" variant="outline" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)} className="divide-y divide-base-200 h-[calc(100%-54px)] max-h-fit overflow-auto">
          {/* Title Section */}
          <TitleSection
            title={formData.title}
            onChange={(title) => setFormData({ ...formData, title })}
            selectedClass={selectedClass}
          />

          {/* Booking Type Section */}
          {!selectedClass && (
            <div className="p-4">
              <BookingTypeDropdown
                bookingType={bookingType}
                onChange={setBookingType}
              />
            </div>
          )}

          {/* Date & Time Section */}
          <DateTimeSection
            bookingType={bookingType}
            selectedDate={selectedDate}
            selectedDates={selectedDates}
            formData={{
              start_time: formData.start_time,
              end_time: formData.end_time,
            }}
            earliestDate={earliestDate}
            onDateSelect={(date) => {
              if (bookingType === 'multiple') {
                setSelectedDates(Array.isArray(date) ? date : []);
              } else {
                const newDate = date as Date;
                setSelectedDate(newDate);
                if (newDate) {
                  const startTime = new Date(formData.start_time);
                  const newStartTime = new Date(newDate);
                  newStartTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
                  const newEndTime = new Date(newStartTime);
                  newEndTime.setHours(newEndTime.getHours() + 1);

                  setFormData({
                    ...formData,
                    start_time: newStartTime.toISOString(),
                    end_time: newEndTime.toISOString(),
                  });
                }
              }
            }}
            onTimeSelect={handleTimeSelect}
            selectedClass={selectedClass}
          />

          {/* Recurring Options */}
          {bookingType === 'recurring' && !selectedClass?.status && (
            <div className="p-4">
              <RecurringOptions
                config={recurringConfig}
                onChange={(config: RecurringConfig) => setRecurringConfig(config)}
                maxOccurrences={availableCredits}
              />
            </div>
          )}

          {/* Notes Section */}
          <NotesSection
            notes={formData.notes}
            onChange={(notes) => setFormData({ ...formData, notes })}
            selectedClass={selectedClass}
          />

          {/* Summary Section */}
          <SummarySection
            selectedClass={selectedClass}
            getClassDates={getClassDates}
            availableCredits={availableCredits}
            isSubmitting={isSubmitting}
            onCancel={selectedClass?.status !== 'completed' && selectedClass?.status !== 'cancelled' ? handleCancel : undefined}
            onClose={handleClose}
            onSubmit={selectedClass?.status !== 'completed' && selectedClass?.status !== 'cancelled' ? async (e: React.FormEvent<HTMLFormElement>) => await handleSubmit(e) : undefined}
          />

          {selectedClass?.status === 'completed' || selectedClass?.status === 'cancelled' ? (
            <div className="bg-yellow-50 p-4 text-yellow-800">
              This class cannot be modified as it has already been {selectedClass.status}.
            </div>
          ) : null}
        </form>
      </div>

      {/* Recurring Edit Dialog */}
      {showRecurringEditDialog && (
        <RecurringEditDialog
          isOpen={showRecurringEditDialog}
          onClose={() => setShowRecurringEditDialog(false)}
          onSubmit={submitChanges}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
            <AlertDialogDescription>
              This class is less than 24 hours away. Cancelling now will result in losing the credit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Don't Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setIsSubmitting(true);
                await cancelClass('single', selectedClass);
                setIsSubmitting(false);
                setShowCancelDialog(false);
                toast.success("Class cancelled");
                onClassUpdated();
                onClose();
              }}
            >
              Cancel Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassModal; 