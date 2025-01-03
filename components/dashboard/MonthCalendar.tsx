"use client";

import { Calendar as CalendarIcon, CaretLeft, CaretRight, Clock } from "@phosphor-icons/react";
import { addMonths, differenceInHours, format, isAfter, isSameDay, subMonths } from "date-fns";
import { useEffect, useState } from "react";

import type { Class } from "@/types/class";
import { ClassModal } from "./ClassModal";
import React from "react";
import { createClient } from "@/libs/supabase/client";
import { toast } from "react-hot-toast";

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  events: Class[];
}

interface TimeSlot {
  start: string;
  end: string;
}

const timeSlots: TimeSlot[] = [
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' },
  { start: '17:00', end: '18:00' },
  { start: '18:00', end: '19:00' },
];

export const MonthCalendar = () => {
  const supabase = createClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [classes, setClasses] = useState<Class[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedClass, setSelectedClass] = useState<Class>();
  const [draggedClass, setDraggedClass] = useState<Class | null>(null);
  const [showRescheduleConfirm, setShowRescheduleConfirm] = useState(false);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [selectedClassToCancel, setSelectedClassToCancel] = useState<Class>();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClasses = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("classes")
          .select("*")
          .eq("student_id", user.id)
          .neq("status", "cancelled");

        setClasses(data || []);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const previousMonthDays = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  ).getDate();

  const days: CalendarDay[] = [];

  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({
      date: previousMonthDays - i,
      isCurrentMonth: false,
      events: [],
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    const dayEvents = classes.filter(
      (cls) =>
        isSameDay(new Date(cls.start_time), date)
    );
    days.push({
      date: i,
      isCurrentMonth: true,
      events: dayEvents,
    });
  }

  // Next month days
  const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      isCurrentMonth: false,
      events: [],
    });
  }

  // Group days into weeks
  const weeks = days.reduce((acc, _, i) => {
    if (i % 7 === 0) {
      acc.push({
        weekNumber: Math.floor(i / 7) + 1,
        days: days.slice(i, i + 7)
      });
    }
    return acc;
  }, [] as { weekNumber: number; days: typeof days }[]);

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  const handleDragStart = (e: React.DragEvent, cls: Class) => {
    e.stopPropagation();
    if (!isAfter(new Date(cls.start_time), new Date())) {
      e.preventDefault();
      toast.error("You can only reschedule future classes");
      return;
    }
    setDraggedClass(cls);
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedClass) return;
    
    // Check if the target date is in the future
    if (!isAfter(date, new Date())) {
      toast.error("You can only reschedule to future dates");
      return;
    }

    setTargetDate(date);
    setShowRescheduleConfirm(true);
  };

  const handleRescheduleConfirm = () => {
    if (draggedClass && targetDate) {
      // Calculate the time difference to maintain the same time of day
      const originalDate = new Date(draggedClass.start_time);
      const newStartTime = new Date(targetDate);
      newStartTime.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0);
      
      const newEndTime = new Date(newStartTime);
      newEndTime.setHours(newEndTime.getHours() + 1);

      setSelectedClass({
        ...draggedClass,
        start_time: newStartTime.toISOString(),
        end_time: newEndTime.toISOString(),
      });
      setSelectedDate(targetDate);
      setIsModalOpen(true);
      setShowRescheduleConfirm(false);
      setDraggedClass(null);
      setTargetDate(null);
    }
  };

  const handleCancelClass = (cls: Class) => {
    setSelectedClassToCancel(cls);
    setShowCancelConfirm(true);
  };

  const handleRescheduleClass = (cls: Class) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  const ClassEvent = ({ cls }: { cls: Class }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const startTime = new Date(cls.start_time);
    const hoursUntilClass = differenceInHours(startTime, new Date());
    const canManageClass = hoursUntilClass > 24;
    
    return (
      <div className="relative">
        <div
          draggable={isAfter(new Date(cls.start_time), new Date())}
          onDragStart={(e) => handleDragStart(e, cls)}
          onMouseEnter={() => setShowTooltip(true)}
          onClick={(e) => {
            e.stopPropagation();
            handleRescheduleClass(cls);
          }}
          className={`
            text-xs p-1.5 rounded-md
            flex items-center gap-1.5
            cursor-pointer transition-colors
            ${cls.status === 'scheduled' ? 'bg-primary/10 hover:bg-primary/20' : ''}
            ${cls.status === 'confirmed' ? 'bg-success/10 hover:bg-success/20' : ''}
            ${cls.status === 'cancelled' ? 'bg-error/10 line-through' : ''}
            ${isAfter(new Date(cls.start_time), new Date()) ? 'cursor-move' : ''}
          `}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
          <span className="font-medium">
            {format(new Date(cls.start_time), "HH:mm")}
          </span>
          <span className="truncate flex-1">
            {cls.title}
          </span>
        </div>

        {/* Tooltip */}
        {showTooltip && cls.status !== 'cancelled' && (
          <div 
            className="absolute z-50 left-0 top-full mt-1 w-64 p-2 bg-base-100 rounded-lg shadow-lg border border-base-300"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-4 h-4" />
                <span>
                  {format(new Date(cls.start_time), "EEEE, MMMM d, yyyy 'at' HH:mm")}
                </span>
              </div>
              
              <div className="flex flex-col gap-1">
                {canManageClass ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRescheduleClass(cls);
                      }}
                      className="btn btn-xs btn-outline w-full justify-start"
                    >
                      Reschedule (Free)
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelClass(cls);
                      }}
                      className="btn btn-xs btn-outline btn-error w-full justify-start"
                    >
                      Cancel (Refund Credit)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRescheduleClass(cls);
                      }}
                      className="btn btn-xs btn-outline w-full justify-start"
                    >
                      Reschedule (Uses 1 Credit)
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelClass(cls);
                      }}
                      className="btn btn-xs btn-outline btn-error w-full justify-start"
                    >
                      Cancel (No Refund)
                    </button>
                  </>
                )}
              </div>

              <p className="text-[10px] text-base-content/70">
                {canManageClass 
                  ? "Free rescheduling/cancellation available up to 24 hours before class"
                  : "Less than 24 hours until class. Rescheduling requires a credit, and cancellation won't be refunded."}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleNewBooking = (date: Date) => {
    const now = new Date();
    const selectedDateTime = new Date(date);
    
    // If selecting today, set time to next available slot after current time
    if (isSameDay(selectedDateTime, now)) {
      const currentHour = now.getHours();
      const nextAvailableHour = timeSlots.find(slot => {
        const [hours] = slot.start.split(':').map(Number);
        return hours > currentHour;
      });

      if (nextAvailableHour) {
        const [hours, minutes] = nextAvailableHour.start.split(':').map(Number);
        selectedDateTime.setHours(hours, minutes, 0, 0);
      } else {
        // If no slots available today, set to tomorrow first slot
        selectedDateTime.setDate(selectedDateTime.getDate() + 1);
        const [hours, minutes] = timeSlots[0].start.split(':').map(Number);
        selectedDateTime.setHours(hours, minutes, 0, 0);
      }
    } else {
      // For future dates, set to first available slot
      const [hours, minutes] = timeSlots[0].start.split(':').map(Number);
      selectedDateTime.setHours(hours, minutes, 0, 0);
    }

    setSelectedDate(selectedDateTime);
    setSelectedClass(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-base-100 rounded-lg shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-base-200">
        <h2 className="text-xl font-semibold mb-4 sm:mb-0">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg bg-base-200">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-base-300 rounded-l-lg"
            >
              <CaretLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())} 
              className="px-3 py-1 hover:bg-base-300 text-sm font-medium"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-base-300 rounded-r-lg"
            >
              <CaretRight className="w-4 h-4" />
            </button>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => handleNewBooking(new Date())}
          >
            Book now
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-2 md:p-4">
        <div className="grid grid-cols-7 text-sm">
          {/* Day headers */}
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="p-2 text-center font-medium text-base-content/70">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day, index) => {
            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day.date
            );

            const isPast = !day.isCurrentMonth || date < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div
                key={index}
                className={`
                  min-h-[100px] p-2 border border-base-200 relative
                  transition-colors
                  ${!day.isCurrentMonth ? "bg-base-200/30" : "bg-base-100"}
                  ${isToday(date) ? "ring-2 ring-primary ring-inset" : ""}
                  ${draggedClass ? "drop-target" : ""}
                  ${isPast ? "cursor-not-allowed opacity-50" : "hover:bg-base-100/50 cursor-pointer"}
                `}
                onClick={() => {
                  if (!isPast) {
                    handleNewBooking(date);
                  }
                }}
                onDragOver={(e) => handleDragOver(e, date)}
                onDrop={(e) => handleDrop(e, date)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span 
                    className={`
                      text-sm font-medium
                      ${!day.isCurrentMonth ? "text-base-content/40" : ""}
                      ${isToday(date) ? "text-primary" : ""}
                    `}
                  >
                    {day.date}
                  </span>
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {day.events.map((cls) => (
                    <ClassEvent
                      key={cls.id}
                      cls={cls}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reschedule Confirmation Modal */}
      {showRescheduleConfirm && draggedClass && targetDate && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRescheduleConfirm(false);
              setDraggedClass(null);
              setTargetDate(null);
            }
          }}
        >
          <div className="w-full max-w-md bg-base-100 rounded-lg p-6 max-h-[80vh] overflow-y-auto m-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Reschedule</h3>
            <p className="mb-4">
              Are you sure you want to reschedule your class from{' '}
              <span className="font-medium">
                {format(new Date(draggedClass.start_time), 'MMMM d, yyyy HH:mm')}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {format(targetDate, 'MMMM d, yyyy')}{' '}
                {format(new Date(draggedClass.start_time), 'HH:mm')}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowRescheduleConfirm(false);
                  setDraggedClass(null);
                  setTargetDate(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleRescheduleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && selectedClassToCancel && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCancelConfirm(false);
              setSelectedClassToCancel(undefined);
            }
          }}
        >
          <div className="w-full max-w-md bg-base-100 rounded-lg p-6 max-h-[80vh] overflow-y-auto m-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Cancellation</h3>
            <p className="mb-4">
              Are you sure you want to cancel your class on{' '}
              <span className="font-medium">
                {format(new Date(selectedClassToCancel.start_time), 'MMMM d, yyyy HH:mm')}
              </span>
              ?
            </p>
            {differenceInHours(new Date(selectedClassToCancel.start_time), new Date()) > 24 ? (
              <p className="text-sm text-base-content/70 mb-4">
                You will receive a refund of 1 credit since you're cancelling more than 24 hours in advance.
              </p>
            ) : (
              <p className="text-sm text-error mb-4">
                No credit will be refunded since you're cancelling less than 24 hours before the class.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowCancelConfirm(false);
                  setSelectedClassToCancel(undefined);
                }}
              >
                Keep Class
              </button>
              <button
                className="btn btn-error"
                onClick={async () => {
                  try {
                    setIsSubmitting(true);
                    const { error } = await supabase
                      .from("classes")
                      .update({
                        status: "cancelled",
                        updated_at: new Date().toISOString(),
                      })
                      .eq("id", selectedClassToCancel.id);

                    if (error) throw error;

                    // Refund credits if cancelling more than 24h before
                    if (differenceInHours(new Date(selectedClassToCancel.start_time), new Date()) > 24) {
                      const {
                        data: { user },
                      } = await supabase.auth.getUser();

                      if (user) {
                        const { data: profile } = await supabase
                          .from("profiles")
                          .select("credits")
                          .eq("id", user.id)
                          .single();

                        await supabase
                          .from("profiles")
                          .update({ 
                            credits: (profile?.credits || 0) + selectedClassToCancel.credits_cost,
                            updated_at: new Date().toISOString()
                          })
                          .eq("id", user.id);
                      }
                    }

                    toast.success("Class cancelled successfully");
                    fetchClasses();
                  } catch (error) {
                    console.error("Error cancelling class:", error);
                    toast.error("Failed to cancel class");
                  } finally {
                    setIsSubmitting(false);
                    setShowCancelConfirm(false);
                    setSelectedClassToCancel(undefined);
                  }
                }}
              >
                Cancel Class
              </button>
            </div>
          </div>
        </div>
      )}

      <ClassModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClass(undefined);
          setSelectedDate(undefined);
        }}
        selectedDate={selectedDate}
        selectedClass={selectedClass}
        onClassUpdated={fetchClasses}
      />
    </div>
  );
};

export default MonthCalendar;
