"use client";

import { Calendar as CalendarIcon, CaretDown, CaretLeft, CaretRight, List } from "@phosphor-icons/react";
import { addMonths, addWeeks, eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek, subMonths, subWeeks } from "date-fns";
import { useEffect, useState } from "react";

import type { Class } from "@/types/class";
import { ClassModal } from "../ClassModal";
import React from "react";
import { createClient } from "@/libs/supabase/client";
import { isDateBookable } from "@/libs/utils/date";
import { toast } from "react-hot-toast";

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  events: Class[];
}

const HOURS = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', 
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', 
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', 
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

export const MonthCalendar = () => {
  const supabase = createClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [classes, setClasses] = useState<Class[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedClass, setSelectedClass] = useState<Class>();
  const [view, setView] = useState<'monthly' | 'weekly'>('monthly');

  const fetchClasses = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const startDate = view === 'monthly' 
          ? new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          : startOfWeek(currentDate);
        
        const endDate = view === 'monthly'
          ? new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
          : endOfWeek(currentDate);

        const { data } = await supabase
          .from("classes")
          .select("*")
          .eq("student_id", user.id)
          .gte("start_time", startDate.toISOString())
          .lte("start_time", endDate.toISOString());

        setClasses(data || []);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [currentDate, view]);

  const handlePreviousPeriod = () => {
    setCurrentDate(prevDate => 
      view === 'monthly' ? subMonths(prevDate, 1) : subWeeks(prevDate, 1)
    );
  };

  const handleNextPeriod = () => {
    setCurrentDate(prevDate => 
      view === 'monthly' ? addMonths(prevDate, 1) : addWeeks(prevDate, 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: Date) => {
    if (!isDateBookable(day)) {
      toast.error("Classes must be scheduled at least 24 business hours in advance");
      return;
    }
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const renderWeeklyView = () => {
    const weekDays = eachDayOfInterval({
      start: startOfWeek(currentDate),
      end: endOfWeek(currentDate)
    });

    const renderClassesForDayAndHour = (day: Date, hour: string) => {
      const hourClasses = classes.filter(cls => {
        const classDate = new Date(cls.start_time);
        const classHour = classDate.getHours().toString().padStart(2, '0') + ':00';
        return isSameDay(classDate, day) && classHour === hour;
      });

      return hourClasses.map((cls) => (
        <div 
          key={cls.id} 
          className={`
            p-1 rounded text-xs cursor-pointer
            ${cls.status === 'scheduled' ? 'bg-primary/10 hover:bg-primary/20 text-primary' : ''}  
            ${cls.status === 'completed' ? 'bg-success/10 hover:bg-success/20 text-success' : ''}
            ${cls.status === 'cancelled' ? 'bg-error/10 hover:bg-error/20 text-error' : ''}
          `}
          onClick={() => {
            setSelectedClass(cls);
            setIsModalOpen(true);
          }}
        >
          {cls.title} ({format(new Date(cls.start_time), 'HH:mm')})
        </div>
      ));
    };

    return (
      <div className="grid grid-cols-8 border rounded">
        {/* Hours Column */}
        <div className="col-span-1 border-r">
          <div className="flex justify-center items-center border-b h-12 font-medium">Time</div>
          {HOURS.map(hour => (
            <div 
              key={hour} 
              className="flex justify-center items-center border-b h-12 text-base-content/70 text-sm"
            >
              {hour}
            </div>
          ))}
        </div>

        {/* Days Columns */}
        {weekDays.map(day => (
          <div key={day.toISOString()} className="col-span-1 border-r">
            <div 
              className={`h-12 border-b flex flex-col items-center justify-center font-medium 
                ${isSameDay(day, new Date()) ? 'bg-primary/10 text-primary' : ''}`}
            >
              <span>{format(day, 'EEE')}</span>
              <span className="font-normal text-sm">{format(day, 'dd')}</span>
            </div>
            {HOURS.map(hour => {
              const dayWithHour = new Date(day);
              const [hourNum] = hour.split(':').map(Number);
              dayWithHour.setHours(hourNum, 0, 0, 0);
              
              return (
                <div 
                  key={hour} 
                  className={`
                    space-y-1 p-1 border-b h-12 overflow-y-hidden
                    ${isDateBookable(dayWithHour) ? 'hover:bg-base-200 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                  `}
                  onClick={() => isDateBookable(dayWithHour) && handleDayClick(dayWithHour)}
                >
                  {renderClassesForDayAndHour(day, hour)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderMonthlyView = () => {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();

    const previousMonthDays = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    ).getDate();

    const days: CalendarDay[] = [];

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        date: previousMonthDays - i,
        isCurrentMonth: false,
        events: [],
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dayEvents = classes.filter(
        (cls) => isSameDay(new Date(cls.start_time), date)
      );
      days.push({
        date: i,
        isCurrentMonth: true,
        events: dayEvents,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        events: [],
      });
    }

    return (
      <div className="border-y grid grid-cols-7 text-center">
        {/* Day names */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="border-x py-2 font-medium text-base-content/70 text-sm">
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((day, index) => {
          const fullDate = new Date(
            day.isCurrentMonth 
              ? currentDate.getFullYear() 
              : (day.date > 20 ? currentDate.getFullYear() : currentDate.getFullYear() + 1),
            day.isCurrentMonth 
              ? currentDate.getMonth() 
              : (day.date > 20 ? currentDate.getMonth() - 1 : currentDate.getMonth() + 1),
            day.date
          );

          const isBookable = isDateBookable(fullDate);

          return (
            <div 
              key={index} 
              className={`
                border p-1 min-h-[100px] 
                ${!day.isCurrentMonth ? 'bg-base-200/50 text-base-content/50' : ''}
                ${isSameDay(fullDate, new Date()) ? 'border-primary text-primary font-bold' : ''}
                ${isBookable ? 'hover:bg-base-200/80 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
              `}
              onClick={() => {
                if (day.isCurrentMonth && isBookable) {
                  handleDayClick(fullDate);
                }
              }}
            >
              <div className="mb-1 font-medium text-sm">{day.date}</div>
              {day.isCurrentMonth && day.events.map((event) => (
                <div 
                  key={event.id} 
                  className={`
                    mb-1 p-1 rounded text-xs cursor-pointer
                    ${event.status === 'scheduled' ? 'bg-primary/10 hover:bg-primary/20 text-primary' : ''}
                    ${event.status === 'completed' ? 'bg-success/10 hover:bg-success/20 text-success' : ''}  
                    ${event.status === 'cancelled' ? 'bg-error/10 hover:bg-error/20 text-error' : ''}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClass(event);
                    setIsModalOpen(true);
                  }}
                >
                  {event.title} ({format(new Date(event.start_time), 'HH:mm')})
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mx-auto p-4 container">
      {/* Navigation */}
      <div className="flex justify-between items-center bg-base-200/50 p-4 border">
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePreviousPeriod} 
            className="btn btn-ghost btn-sm"
          >
            <CaretLeft />
          </button>
          <h2 className="font-semibold text-xl">
            {view === 'monthly' 
              ? format(currentDate, 'MMMM yyyy') 
              : `${format(currentDate, 'MMMM yyyy')} - Week of ${format(startOfWeek(currentDate), 'dd MMM')}`}
          </h2>
          <button 
            onClick={handleNextPeriod} 
            className="btn btn-ghost btn-sm"
          >
            <CaretRight />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleToday} 
            className="mr-2 btn btn-accent btn-sm"
          >
            Today
          </button>
          
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="flex items-center gap-2 m-1 btn btn-outline btn-primary btn-sm">
              {view === 'monthly' ? 'Monthly' : 'Weekly'} View
              <CaretDown className="w-4 h-4" />
            </div>
            <ul 
              tabIndex={0} 
              className="z-[1] bg-base-100 shadow p-2 rounded-box w-52 dropdown-content menu"
              onBlur={() => {
                const dropdown = document.activeElement?.closest('.dropdown');
                if (dropdown) dropdown.classList.remove('dropdown-open');
              }}
            >
              <li>
                <a 
                  className={view === 'monthly' ? 'active' : ''}
                  onClick={() => setView('monthly')}
                >
                  <List className="mr-2" /> Monthly View
                </a>
              </li>
              <li>
                <a
                  className={view === 'weekly' ? 'active' : ''}
                  onClick={() => setView('weekly')}
                >
                  <CalendarIcon className="mr-2" /> Weekly View
                </a>
              </li>
            </ul>
          </div>

          <button 
            onClick={() => {
              setSelectedDate(new Date());
              setIsModalOpen(true);
            }} 
            className="ml-2 text-base-200 btn btn-primary btn-sm"
          >
            Schedule Class
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'monthly' ? renderMonthlyView() : renderWeeklyView()}

      {/* Class Modal */}
      <ClassModal
        key={`${selectedDate?.toISOString()}-${selectedClass?.id}`}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClass(undefined);
          setSelectedDate(undefined);
        }}
        selectedDate={selectedDate || new Date()}
        selectedClass={selectedClass}
        onClassUpdated={fetchClasses}
      />
    </div>
  );
};

export default MonthCalendar;
