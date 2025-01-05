import { format } from "date-fns";
import { useState } from "react";

interface TimeSlot {
  start: string;
  end: string;
}

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedTime: string;
  onSelect: (startTime: string, endTime: string) => void;
  disabled?: boolean;
  initialTime?: string;
}

export const TimeSlotPicker = ({
  timeSlots,
  selectedTime,
  onSelect,
  disabled,
  initialTime
}: TimeSlotPickerProps) => {
  const [activeTime, setActiveTime] = useState(initialTime || format(new Date(selectedTime), 'HH:mm'));

  const handleTimeSelect = (start: string, end: string) => {
    setActiveTime(start);
    onSelect(start, end);
  };

  return (
    <div className="space-y-2">
      <label className="block font-medium text-sm">Time</label>
      <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
        {timeSlots.map(({ start, end }) => {
          const isSelected = start === activeTime;
          
          return (
            <button
              key={start}
              type="button"
              disabled={disabled}
              className={`
                px-4 py-2 rounded-md text-sm font-medium btn
                ${disabled ?? 'btn-disabled cursor-not-allowed'}
                ${isSelected ? 'btn-primary text-base-100' : 'btn-outline'}
              `}
              onClick={() => handleTimeSelect(start, end)}
            >
              {start} - {end}
            </button>
          );
        })}
      </div>
    </div>
  );
}; 