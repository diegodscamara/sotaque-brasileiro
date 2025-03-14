import React from "react";
import { TeacherComplete } from "@/types/teacher";
import { TimeSlot } from "../../types";
import { useTranslations } from "next-intl";

interface StepHeaderProps {
  t: ReturnType<typeof useTranslations>;
  selectedTeacher: TeacherComplete | null;
  selectedDate: Date | null;
  selectedTimeSlot: TimeSlot | null;
}

/**
 * Header component for Step 2 of the onboarding process
 * @param {StepHeaderProps} props - Component props
 * @returns {React.JSX.Element} The step header component
 */
export default function StepHeader({
  t,
  selectedTeacher,
  selectedDate,
  selectedTimeSlot
}: StepHeaderProps): React.JSX.Element {
  const getTeacherDisplayName = (teacher: TeacherComplete) => {
    const { firstName, lastName } = teacher.user;
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return "Teacher";
  };

  return (
    <div className="mb-6">
      <h2 className="mb-2 font-semibold text-2xl">{t("step2.title")}</h2>
      <p className="text-muted-foreground">
        {selectedTeacher
          ? t("step2.selectedTeacherDescription", {
              teacher: getTeacherDisplayName(selectedTeacher),
              date: selectedDate
                ? new Intl.DateTimeFormat("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(selectedDate)
                : "",
              time: selectedTimeSlot
                ? `${selectedTimeSlot.displayStartTime} - ${selectedTimeSlot.displayEndTime}`
                : "",
            })
          : t("step2.description")}
      </p>
    </div>
  );
} 