import { addBusinessDays, addDays, format, isBefore, setHours } from "date-fns";
import { useEffect, useRef, useState } from "react";

import { CaretDown } from "@phosphor-icons/react";
import { DayPicker } from "react-day-picker";

interface DatePickerProps {
  mode: 'single' | 'multiple';
  selected: Date | Date[] | undefined;
  onSelect: (date: Date | Date[] | undefined) => void;
  minDate?: Date;
}

const isDateDisabled = (date: Date) => {
  const now = new Date();
  const earliestDate = setHours(addBusinessDays(now, 1), 9);
  return isBefore(date, earliestDate);
};

export const DatePicker = ({ mode, selected, onSelect, minDate }: DatePickerProps) => {
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

  const handleSelect = (date: Date | Date[] | undefined) => {
    onSelect(date);
    if (mode === 'single' && date) {
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    if (mode === 'multiple') {
      const dates = selected as Date[];
      return dates?.length 
        ? `${dates.length} date${dates.length !== 1 ? 's' : ''} selected`
        : 'Select dates';
    } else {
      const date = selected as Date;
      return date 
        ? format(date, 'EEEE, MMMM d, yyyy')
        : 'Select a date';
    }
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <button
        type="button"
        className="justify-start gap-2 px-2 w-fit font-normal btn btn-outline"
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
            {mode === 'multiple' ? (
              <DayPicker
                mode="multiple"
                selected={selected as Date[]}
                onSelect={(dates) => handleSelect(dates || [])}
                disabled={isDateDisabled}
                modifiersStyles={{
                  selected: {
                    backgroundColor: 'hsl(var(--p))',
                    color: 'hsl(var(--pc))',
                    fontWeight: 'bold'
                  }
                }}
                styles={{
                  caption: { color: 'hsl(var(--bc))' },
                  head_cell: { color: 'hsl(var(--bc) / 0.7)' },
                  cell: { color: 'hsl(var(--bc))', padding: '0.5rem' },
                  nav_button: { 
                    color: 'hsl(var(--bc))',
                    border: '1px solid hsl(var(--b2))',
                    borderRadius: '0.5rem'
                  },
                  day: {
                    margin: '1px',
                    height: '2.2rem',
                    width: '2.2rem',
                    fontSize: '0.875rem',
                    borderRadius: '0.5rem'
                  }
                }}
                className="p-3"
              />
            ) : (
              <DayPicker
                mode="single"
                selected={selected as Date}
                onSelect={(date) => handleSelect(date)}
                disabled={isDateDisabled}
                modifiersStyles={{
                  selected: {
                    backgroundColor: 'hsl(var(--p))',
                    color: 'hsl(var(--pc))',
                    fontWeight: 'bold'
                  }
                }}
                styles={{
                  caption: { color: 'hsl(var(--bc))' },
                  head_cell: { color: 'hsl(var(--bc) / 0.7)' },
                  cell: { color: 'hsl(var(--bc))', padding: '0.5rem' },
                  nav_button: { 
                    color: 'hsl(var(--bc))',
                    border: '1px solid hsl(var(--b2))',
                    borderRadius: '0.5rem'
                  },
                  day: {
                    margin: '1px',
                    height: '2.2rem',
                    width: '2.2rem',
                    fontSize: '0.875rem',
                    borderRadius: '0.5rem'
                  }
                }}
                className="p-3"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 