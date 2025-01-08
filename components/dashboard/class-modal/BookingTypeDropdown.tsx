import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BookingType = 'single' | 'multiple' | 'recurring';

interface BookingTypeDropdownProps {
  bookingType?: BookingType;
  onChange: (type: BookingType) => void;
}

const BookingTypeDropdown = ({ bookingType = 'single', onChange }: BookingTypeDropdownProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-sm">Booking type:</span>
      <Select
        value={bookingType || undefined}
        onValueChange={(value) => onChange(value as BookingType)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select booking type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="single">Single Class</SelectItem>
          <SelectItem value="multiple">Multiple Classes</SelectItem>
          <SelectItem value="recurring">Recurring Classes</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default BookingTypeDropdown; 