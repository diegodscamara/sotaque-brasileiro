import { format } from "date-fns";

interface TimeSlot {
  start: string;
  end: string;
}

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedTime: string;
  onSelect: (startTime: string, endTime: string) => void;
  disabled?: boolean;
}

export const TimeSlotPicker = ({ timeSlots, selectedTime, onSelect, disabled }: TimeSlotPickerProps) => {
  const isSelected = (slot: TimeSlot) => {
    if (!selectedTime) return false;
    const selectedHour = format(new Date(selectedTime), 'HH:mm');
    return selectedHour === slot.start;
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Time slot</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {timeSlots.map((slot) => (
          <button
            key={slot.start}
            type="button"
            className={`
              btn btn-sm w-full
              ${isSelected(slot) ? 'btn-primary' : 'btn-outline'}
              ${disabled ? 'btn-disabled' : ''}
            `}
            onClick={() => onSelect(slot.start, slot.end)}
            disabled={disabled}
          >
            {slot.start}
          </button>
        ))}
      </div>
      <p className="text-xs text-base-content/70 mt-1">
        All classes are 1 hour long
      </p>
    </div>
  );
}; 