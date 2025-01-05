import { CaretDown } from "@phosphor-icons/react";

type BookingType = 'single' | 'multiple' | 'recurring';

interface BookingTypeDropdownProps {
  bookingType: BookingType;
  onChange: (type: BookingType) => void;
}

const BookingTypeDropdown = ({ bookingType, onChange }: BookingTypeDropdownProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-sm">Booking type:</span>
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="border-primary w-full max-w-xs btn btn-outline btn-primary btn-sm">
          {bookingType === 'single' && 'Single Class'}
          {bookingType === 'multiple' && 'Multiple Classes'}
          {bookingType === 'recurring' && 'Recurring Classes'}
          <CaretDown className="w-4 h-4 text-primary" />
        </div>
        <ul tabIndex={0} className="bg-base-200 shadow-lg p-2 rounded-md w-52 dropdown-content menu">
          <li>
            <a
              className={bookingType === 'single' ? 'active' : ''}
              onClick={() => onChange('single')}
            >
              Single Class
            </a>
          </li>
          <li>
            <a
              className={bookingType === 'multiple' ? 'active' : ''}
              onClick={() => onChange('multiple')}
            >
              Multiple Classes
            </a>
          </li>
          <li>
            <a
              className={bookingType === 'recurring' ? 'active' : ''}
              onClick={() => onChange('recurring')}
            >
              Recurring Classes
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BookingTypeDropdown; 