import { DateRange, DayPicker } from "react-day-picker";
import { addBusinessDays, format, isBefore, setHours } from "date-fns";
import { useEffect, useRef, useState } from "react";

import { CaretDown } from "@phosphor-icons/react";
import { Class } from "@/types/class";

interface SingleDatePickerProps {
  mode: 'single';
  selected: Date | undefined;
  onSelect: (date: Date | DateRange | undefined) => void;
  minDate?: Date;
  selectedClass?: Class;
}

interface MultipleDatePickerProps {
  mode: 'multiple';
  selected: DateRange | undefined;
  onSelect: (date: Date | DateRange | undefined) => void;
  minDate?: Date;
  selectedClass?: Class;
}

type DatePickerProps = SingleDatePickerProps | MultipleDatePickerProps;

const isDateDisabled = (date: Date) => {
  const now = new Date();
  const earliestDate = setHours(addBusinessDays(now, 1), 9);
  return isBefore(date, earliestDate);
};

const isSingleDatePicker = (props: DatePickerProps): props is SingleDatePickerProps => {
  return props.mode === 'single';
};

export const DatePicker = (props: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (date: Date | DateRange | undefined) => {
    if (props.mode === 'single') {
      props.onSelect(date as Date);
      if (date) {
        setIsOpen(false);
      }
    } else {
      props.onSelect(date as DateRange);
    }
  };

  const getDisplayText = () => {
    if (props.mode === 'multiple') {
      const dateRange = props.selected as DateRange;
      return dateRange?.from && dateRange?.to
        ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
        : 'Select date range';
    } else {
      const date = props.selected as Date;
      return date
        ? format(date, 'EEEE, MMMM d, yyyy')
        : 'Select a date';
    }
  };

  const renderDayPicker = () => {
    if (props.mode === 'single') {
      return (
        <DayPicker
          mode="single"
          selected={props.selected}
          onSelect={props.onSelect}
          modifiers={{
            disabled: props.selectedClass?.status === 'completed' || props.selectedClass?.status === 'cancelled'
          }}
          modifiersClassNames={{
            selected: 'bg-primary text-white',
          }}
          fromDate={props.minDate}
        />
      );
    }

    return (
      <DayPicker
        mode="range"
        selected={props.selected}
        onSelect={props.onSelect}
        modifiers={{
          disabled: props.selectedClass?.status === 'completed' || props.selectedClass?.status === 'cancelled'
        }}
        modifiersClassNames={{
          selected: 'bg-primary text-white',
        }}
        fromDate={props.minDate}
      />
    );
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <button
        type="button"
        className="justify-start gap-2 px-2 w-fit btn btn-outline btn-primary btn-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {getDisplayText()}
        <CaretDown className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="relative" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsOpen(!isOpen);
          }
        }}>
          <div className="top-0 left-0 z-10 absolute bg-base-200 shadow-lg border rounded-md">
            {renderDayPicker()}
          </div>
        </div>
      )}
    </div>
  );
}; 