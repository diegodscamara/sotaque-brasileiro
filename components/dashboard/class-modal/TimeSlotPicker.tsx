import { format, isValid, parse } from "date-fns";

import { TimePicker } from "@/components/ui/time-picker";
import { useState } from "react";

interface TimeSlotPickerProps {
  selectedTime: string;
  onSelect: (startTime: string, endTime: string) => void;
  disabled?: boolean;
  initialTime?: string;
}

export const TimeSlotPicker = ({
  selectedTime,
  onSelect,
  disabled,
  initialTime
}: TimeSlotPickerProps) => {
  const parsedSelectedTime = parse(selectedTime, 'HH:mm:ss', new Date());
  const formattedSelectedTime = isValid(parsedSelectedTime) ? format(parsedSelectedTime, 'h:mm a') : '';
  const [activeTime, setActiveTime] = useState(initialTime || formattedSelectedTime || format(new Date(), 'h:mm a'));

  const handleTimeSelect = (time: string) => {
    setActiveTime(time);
    const [hours, minutes, period] = time.split(/:|\s/);
    const formattedHours = period === 'PM' ? (parseInt(hours) === 12 ? '12' : (parseInt(hours) + 12).toString()) : (parseInt(hours) === 12 ? '00' : hours.padStart(2, '0'));
    const startTime = `${formattedHours}:${minutes}`;
    const endTime = `${(parseInt(formattedHours) + 1).toString().padStart(2, '0')}:${minutes}`;
    onSelect(startTime, endTime);
  };

  return (
    <div className="space-y-2">
      <label className="block font-medium text-sm">Time</label>
      <TimePicker
        selectedTime={activeTime}
        onSelect={handleTimeSelect}
      />
    </div>
  );
}; 