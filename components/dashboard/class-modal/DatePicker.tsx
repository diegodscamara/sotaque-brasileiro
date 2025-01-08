import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { addBusinessDays, format, isBefore, setHours } from "date-fns";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Class } from "@/types/class";
import { DateRange } from "react-day-picker";
import { cn } from "@/libs/utils"

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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !props.selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {props.mode === 'single' ? (
            props.selected ? format(props.selected as Date, "PPP") : <span>Pick a date</span>
          ) : (
            props.selected && props.selected.from && props.selected.to ? (
              `${format(props.selected.from as Date, "PPP")} - ${format(props.selected.to as Date, "PPP")}`
            ) : (
              <span>Pick a date range</span>
            )
          )}        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="start">
        {props.mode === 'single' ? (
          <Calendar
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
        ) : (
          <Calendar
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
        )}
      </PopoverContent>
    </Popover>
  );
}; 