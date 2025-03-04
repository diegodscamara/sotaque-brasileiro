import React from "react";
import { format } from "date-fns";
import { Calendar, Clock, Star } from "@phosphor-icons/react";
import Image from "next/image";
import { cn } from "@/libs/utils";

// UI Components
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";

// Types
import { OnboardingFormData } from "../../types";

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

interface ScheduleTabProps {
  t: any;
  formData: OnboardingFormData;
  errors: Record<string, string | undefined>;
  selectedTeacher: string | null;
  selectedDate: Date | undefined;
  selectedTimeSlot: string | null;
  timeSlots: TimeSlot[];
  isLoadingTimeSlots: boolean;
  teachers: any[];
  handleDateSelect: (date: Date | undefined) => Promise<void>;
  handleTimeSlotSelect: (slot: TimeSlot) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

/**
 * Component for the schedule tab
 * @param {ScheduleTabProps} props - Component props
 * @returns {React.JSX.Element} The schedule tab component
 */
export default function ScheduleTab({
  t,
  formData,
  errors,
  selectedTeacher,
  selectedDate,
  selectedTimeSlot,
  timeSlots,
  isLoadingTimeSlots,
  teachers,
  handleDateSelect,
  handleTimeSlotSelect,
  handleInputChange
}: ScheduleTabProps): React.JSX.Element {
  return (
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
                {isLoadingTimeSlots ? (
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
                          onClick={() => handleTimeSlotSelect(slot)}
                          disabled={!slot.isAvailable || isLoadingTimeSlots}
                          aria-checked={selectedTimeSlot === slot.id}
                          aria-label={`Select time slot at ${format(slot.startDateTime, "h:mm a")}`}
                          role="radio"
                          className={cn(
                            "w-full flex flex-col items-center justify-center rounded-md border-2 p-2",
                            "transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                            selectedTimeSlot === slot.id
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : "border-muted bg-popover",
                            "hover:bg-accent hover:text-accent-foreground",
                            !slot.isAvailable || isLoadingTimeSlots ? "cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-800" : "cursor-pointer"
                          )}
                        >
                          <span className="font-medium text-sm">
                            {format(slot.startDateTime, "h:mm a")}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!isLoadingTimeSlots && timeSlots.length === 0 && (
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
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                              const slot = timeSlots.find(s => s.id === selectedTimeSlot);
                              if (!slot) {
                                return <span>{t("step2.schedule.timeSlotNotFound")}</span>;
                              }

                              // Calculate duration in minutes
                              const durationMs = slot.endDateTime.getTime() - slot.startDateTime.getTime();
                              const durationMinutes = Math.round(durationMs / (1000 * 60));

                              return (
                                <>
                                  <span>
                                    {format(slot.startDateTime, "h:mm a")} - {format(slot.endDateTime, "h:mm a")}
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
  );
} 