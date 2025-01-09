import { format, parse } from "date-fns";

import { Class } from "@/types/class";
import { Clock } from "@phosphor-icons/react";
import { DatePicker } from "./DatePicker";
import { DateRange } from "react-day-picker";
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
  selectedClass?: Class;
}

const DateTimeSection = ({
  bookingType,
  selectedDate,
  selectedDates,
  formData,
  earliestDate,
  onDateSelect,
  onTimeSelect,
  selectedClass,
}: DateTimeSectionProps) => {
  const isImmutable = selectedClass?.status === 'completed' || selectedClass?.status === 'cancelled';

  const handleDateSelect = (date: Date | DateRange | undefined) => {
    if (bookingType === 'multiple' && date && 'from' in date && date.from && date.to) {
      const dates = [];
      let currentDate = new Date(date.from);
      while (currentDate <= date.to) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      onDateSelect(dates);
    } else {
      onDateSelect(date as Date);
    }
  };

  const handleTimeSelect = (time: string) => {
    const [hours, minutes, period] = time.split(/:|\s/);
    const formattedHours = period === 'PM' ? (parseInt(hours) + 12).toString() : hours.padStart(2, '0');
    const startTime = `${formattedHours}:${minutes}`;
    const endTime = `${(parseInt(formattedHours) + 1).toString().padStart(2, '0')}:${minutes}`;
    onTimeSelect(startTime, endTime);
  };

  if (isImmutable && selectedDate) {
    const startTime = new Date(formData.start_time);
    const endTime = new Date(formData.end_time);
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-start gap-3">
          <Clock className="mt-1 w-5 h-5 text-base-content/70" />
          <div className="flex-1">
            <p className="text-base-content">
              {format(selectedDate, 'MMMM d, yyyy')} at {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start gap-3">
        <Clock className="mt-3 w-5 h-5 text-base-content/70" />
        <div className="flex-1 space-y-4 w-fit">
          {bookingType === 'multiple' ? (
            <DatePicker
              mode="multiple"
              selected={{ from: selectedDates[0], to: selectedDates[selectedDates.length - 1] }}
              onSelect={handleDateSelect}
              minDate={earliestDate}
              selectedClass={selectedClass}
            />
          ) : (
            <DatePicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              minDate={earliestDate}
              selectedClass={selectedClass}
            />
          )}

          <TimeSlotPicker
            selectedTime={formData.start_time}
            onSelect={handleTimeSelect}
            disabled={!selectedDate}
            initialTime={formData.start_time}
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