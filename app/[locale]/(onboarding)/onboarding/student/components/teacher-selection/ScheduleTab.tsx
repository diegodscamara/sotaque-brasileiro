import React from "react";
import { TeacherComplete } from "@/types/teacher";
import { TimeSlot, Step2FormData } from "../../types";
import { useTranslations } from "next-intl";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ScheduleTabProps {
  t: ReturnType<typeof useTranslations>;
  formData: Step2FormData;
  errors: Record<string, string>;
  selectedTeacher: TeacherComplete | null;
  selectedDate: Date | null;
  selectedTimeSlot: TimeSlot | null;
  timeSlots: TimeSlot[];
  isLoadingTimeSlots: boolean;
  teachers: TeacherComplete[];
  handleDateSelect: (date: Date) => Promise<void>;
  handleTimeSlotSelect: (slot: TimeSlot) => Promise<void>;
  handleInputChange: (name: string, value: any) => void;
}

/**
 * Tab component for scheduling a class
 * @param {ScheduleTabProps} props - Component props
 * @returns {React.JSX.Element} The schedule tab component
 */
export default function ScheduleTab({
  t,
  formData,
  selectedTeacher,
  selectedDate,
  selectedTimeSlot,
  timeSlots,
  isLoadingTimeSlots,
  handleDateSelect,
  handleTimeSlotSelect,
  handleInputChange
}: ScheduleTabProps): React.JSX.Element {
  const getTeacherDisplayName = (teacher: TeacherComplete) => {
    const { firstName, lastName } = teacher.user;
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return "Teacher";
  };

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div>
        <h3 className="mb-2 font-medium">{t("step2.schedule.selectDate")}</h3>
        <Calendar
          mode="single"
          selected={selectedDate || undefined}
          onSelect={(date) => date && handleDateSelect(date)}
          disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
          className="border rounded-md"
        />
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <h3 className="mb-2 font-medium">{t("step2.schedule.selectTime")}</h3>
          {isLoadingTimeSlots ? (
            <div className="gap-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {[...Array(8)].map((_, index) => (
                <Skeleton key={index} className="w-full h-10" />
              ))}
            </div>
          ) : timeSlots.length > 0 ? (
            <div className="gap-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.id}
                  variant={selectedTimeSlot === slot ? "default" : "outline"}
                  className="w-full"
                  onClick={() => handleTimeSlotSelect(slot)}
                  data-selected-time-slot={selectedTimeSlot === slot ? "true" : "false"}
                  data-time-slot-id={slot.id}
                >
                  {slot.displayStartTime} - {slot.displayEndTime}
                </Button>
              ))}
            </div>
          ) : (
            <Card className="p-4">
              <p className="text-muted-foreground text-sm">
                {t("step2.schedule.noTimeSlotsAvailable", {
                  teacher: selectedTeacher ? getTeacherDisplayName(selectedTeacher) : "",
                  date: selectedDate.toLocaleDateString(),
                })}
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Notes */}
      {selectedTimeSlot && (
        <div>
          <h3 className="mb-2 font-medium">{t("step2.schedule.notes.title")}</h3>
          <Textarea
            placeholder={t("step2.schedule.notes.placeholder")}
            value={formData.notes || ""}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      )}
    </div>
  );
} 