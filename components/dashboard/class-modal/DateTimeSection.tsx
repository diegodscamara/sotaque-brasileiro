import { Clock } from "@phosphor-icons/react";
import { DatePicker } from "./DatePicker";
import { TimeSlotPicker } from "./TimeSlotPicker";

type BookingType = 'single' | 'multiple' | 'recurring';

interface DateTimeSectionProps {
  bookingType: BookingType;
  selectedDate: Date | undefined;
  selectedDates: Date[];
  formData: {
    start_time: string;
    end_time: string;
  };
  earliestDate: Date;
  onDateSelect: (date: Date | Date[]) => void;
  onTimeSelect: (startTime: string, endTime: string) => void;
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

const DateTimeSection = ({
  bookingType,
  selectedDate,
  selectedDates,
  formData,
  earliestDate,
  onDateSelect,
  onTimeSelect,
}: DateTimeSectionProps) => {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start gap-3">
        <Clock className="mt-3 w-5 h-5 text-base-content/70" />
        <div className="flex-1 space-y-4 w-fit">
          <DatePicker
            mode={bookingType === 'multiple' ? 'multiple' : 'single'}
            selected={bookingType === 'multiple' ? selectedDates : selectedDate}
            onSelect={onDateSelect}
            minDate={earliestDate}
          />

          <TimeSlotPicker
            timeSlots={timeSlots}
            selectedTime={formData.start_time}
            onSelect={onTimeSelect}
            disabled={!selectedDate}
          />

          <p className="text-base-content/70 text-sm">
            Note: Classes can only be scheduled at least 24 business hours in advance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DateTimeSection; 