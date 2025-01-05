"use client";

import { CaretDown, Clock, NotePencil, X } from "@phosphor-icons/react";
import { addBusinessDays, addDays, getDay, setHours } from "date-fns";
import { useEffect, useState } from "react";

import { Class } from "@/types/class";
import { DatePicker } from "./calendar/DatePicker";
import { RecurringOptions } from "./calendar/RecurringOptions";
import { TimeSlotPicker } from "./calendar/TimeSlotPicker";
import { createClient } from "@/libs/supabase/client";
import { isDateBookable } from "@/utils/date";
import { toast } from "react-hot-toast";

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

const timeSlots = [
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' },
  { start: '17:00', end: '18:00' },
  { start: '18:00', end: '19:00' },
];

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
          .from("profiles")
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
          .from("profiles")
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  const handleCancel = () => {
    if (selectedClass?.recurring_group_id) {
      setShowCancelDialog(true);
    } else {
      cancelClass('single');
    }
  };

  const cancelClass = async (cancelType: 'single' | 'all') => {
    if (!selectedClass) return;

    try {
      setIsSubmitting(true);

      if (cancelType === 'single') {
        // Cancel single class and remove it from the recurring group
        const { error } = await supabase
          .from("classes")
          .update({
            status: "cancelled",
            recurring_group_id: null, // Remove from recurring group
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedClass.id);

        if (error) throw error;

        // Refund 1 credit for the cancelled class
        await supabase
          .from("profiles")
          .update({
            credits: availableCredits + 1, // Refund 1 credit
          })
          .eq("id", selectedClass.student_id); // Ensure refund goes to the correct user
      } else {
        // Cancel all future classes in the recurring group
        const { error } = await supabase
          .from("classes")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("recurring_group_id", selectedClass.recurring_group_id)
          .gte("start_time", new Date().toISOString()); // Only cancel future classes

        if (error) throw error;

        // Refund credits for all cancelled classes
        const { count } = await supabase
          .from("classes")
          .select("id", { count: 'exact' }) // Get the count of classes to be refunded
          .eq("recurring_group_id", selectedClass.recurring_group_id)
          .gte("start_time", new Date().toISOString());

        // Refund credits based on the number of cancelled classes
        await supabase
          .from("profiles")
          .update({
            credits: availableCredits + count, // Refund credits based on the number of cancelled classes
          })
          .eq("id", selectedClass.student_id);
      }

      // The trigger function will handle credit refunds automatically
      toast.success(cancelType === 'single'
        ? "Class cancelled successfully"
        : "All future recurring classes cancelled successfully"
      );
      onClassUpdated();
      onClose();
    } catch (error) {
      console.error("Error cancelling class:", error);
      toast.error("Failed to cancel class");
    } finally {
      setIsSubmitting(false);
      setShowCancelDialog(false);
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
        <div className="flex justify-between items-center bg-primary p-4 text-primary-content text">
          <h2 className="font-medium text-lg">
            {selectedClass ? "Edit Class" : "Schedule Classes"}
          </h2>
          <button onClick={handleClose} className="text-primary-content btn btn-outline btn-sm btn-square">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="divide-y divide-base-200 h-[calc(100%-54px)] max-h-fit overflow-auto">
          {/* Title Section */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              <NotePencil className="w-5 h-5 text-base-content/70" />
              <input
                type="text"
                className="focus:bg-transparent px-2 w-full font-medium text-lg input input-primary"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Add title"
                required
              />
            </div>
          </div>

          {/* Booking Type Section */}
          {!selectedClass && (
            <div className="p-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Booking type:</span>
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="border-primary w-full max-w-xs btn btn-outline">
                    {bookingType === 'single' && 'Single Class'}
                    {bookingType === 'multiple' && 'Multiple Classes'}
                    {bookingType === 'recurring' && 'Recurring Classes'}
                    <CaretDown className="w-4 h-4 text-primary" />
                  </div>
                  <ul tabIndex={0} className="bg-base-200 shadow-lg p-2 rounded-md w-52 dropdown-content menu">
                    <li>
                      <a
                        className={bookingType === 'single' ? 'active' : ''}
                        onClick={() => setBookingType('single')}
                      >
                        Single Class
                      </a>
                    </li>
                    <li>
                      <a
                        className={bookingType === 'multiple' ? 'active' : ''}
                        onClick={() => setBookingType('multiple')}
                      >
                        Multiple Classes
                      </a>
                    </li>
                    <li>
                      <a
                        className={bookingType === 'recurring' ? 'active' : ''}
                        onClick={() => setBookingType('recurring')}
                      >
                        Recurring Classes
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Date & Time Section */}
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-3">
              <Clock className="mt-3 w-5 h-5 text-base-content/70" />
              <div className="flex-1 space-y-4 w-fit">
                <DatePicker
                  mode={bookingType === 'multiple' ? 'multiple' : 'single'}
                  selected={bookingType === 'multiple' ? selectedDates : selectedDate}
                  onSelect={(date) => {
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
                  minDate={earliestDate}
                />

                <TimeSlotPicker
                  timeSlots={timeSlots}
                  selectedTime={formData.start_time}
                  onSelect={handleTimeSelect}
                  disabled={!selectedDate}
                />

                <p className="text-base-content/70 text-sm">
                  Note: Classes can only be scheduled at least 24 business hours in advance.
                </p>
              </div>
            </div>
          </div>

          {/* Recurring Options */}
          {bookingType === 'recurring' && (
            <div className="p-4">
              <RecurringOptions
                config={recurringConfig}
                onChange={(config: RecurringConfig) => setRecurringConfig(config)}
                maxOccurrences={availableCredits}
              />
            </div>
          )}

          {/* Notes Section */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              <NotePencil className="mt-2 w-5 h-5 text-base-content/70" />
              <textarea
                className="focus:bg-transparent px-2 border w-full min-h-[100px] textarea textarea-primary"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add description or special requests..."
                rows={3}
              />
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-base-200/50 p-4">
            <div className="flex justify-between items-center text-sm">
              <div className="space-y-1">
                {!selectedClass && (
                  <>
                    <p>Classes to book: {getClassDates().length}</p>
                    <p>Credits required: {getClassDates().length}</p>
                    <p>Credits available: {availableCredits}</p>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {selectedClass ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-red-600 hover:bg-red-700 text-base-200 btn btn-error btn-sm"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                      Cancel Class
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="btn btn-outline btn-sm"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                      Abandon Changes
                    </button>
                    <button
                      type="submit"
                      className="text-base-200 btn btn-primary btn-sm"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                      {isSubmitting ? "Saving..." : "Update"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="bg-red-600 hover:bg-red-700 text-base-200 btn btn-error btn-sm"
                    >
                      {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="text-base-200 btn btn-primary btn-sm"
                      disabled={
                        isSubmitting ||
                        !selectedDate ||
                        (bookingType === 'recurring' && recurringConfig.daysOfWeek.length === 0) ||
                        (bookingType === 'multiple' && selectedDates.length === 0)
                      }
                    >
                      {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                      {isSubmitting ? "Saving..." : `Schedule ${getClassDates().length > 1 ? 'Classes' : 'Class'}`}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Recurring Edit Dialog */}
      {showRecurringEditDialog && (
        <div className="z-[60] fixed inset-0 flex justify-center items-center bg-black/50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-sm">
            <h3 className="mb-4 font-medium text-lg">Edit Recurring Class</h3>
            <p className="mb-6 text-base-content/70">
              Would you like to edit this class only, or all classes in the series?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => setShowRecurringEditDialog(false)}
              >
                {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                Cancel
              </button>
              <button
                className="btn btn-outline"
                onClick={() => submitChanges('single')}
              >
                {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                This class
              </button>
              <button
                className="btn btn-primary"
                onClick={() => submitChanges('all')}
              >
                {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                All classes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="z-[60] fixed inset-0 flex justify-center items-center bg-black/50">
          <div className="bg-base-100 shadow-lg p-6 rounded-lg w-full max-w-md">
            <h3 className="mb-4 font-medium text-lg">Cancel Recurring Class</h3>
            <p className="mb-6 text-base-content/70">
              Would you like to cancel this class only, or all future classes in the series?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowCancelDialog(false)}
              >
                {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                Keep Classes
              </button>
              <button
                className="btn btn-accent btn-sm"
                onClick={() => cancelClass('single')}
              >
                {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                This class
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-base-200 btn btn-sm"
                onClick={() => cancelClass('all')}
              >
                {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                All future classes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassModal; 