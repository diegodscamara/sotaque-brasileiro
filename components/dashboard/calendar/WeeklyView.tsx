"use client";

import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { addWeeks, eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek, subWeeks } from 'date-fns';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Class } from '@/types/class';
import { ClassModal } from '../ClassModal';
import { createClient } from '@/libs/supabase/client';

const HOURS = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', 
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', 
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', 
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

export const WeeklyView = () => {
  const supabase = createClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [classes, setClasses] = useState<Class[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedClass, setSelectedClass] = useState<Class>();

  const fetchClasses = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);

        const { data } = await supabase
          .from("classes")
          .select("*")
          .eq("student_id", user.id)
          .neq("status", "cancelled")
          .gte("start_time", weekStart.toISOString())
          .lte("start_time", weekEnd.toISOString());

        setClasses(data || []);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [currentDate]);

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate),
    end: endOfWeek(currentDate)
  });

  const handlePreviousWeek = () => {
    setCurrentDate(prevDate => subWeeks(prevDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prevDate => addWeeks(prevDate, 1));
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const handleClassClick = (cls: Class) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  const renderClassesForDayAndHour = (day: Date, hour: string) => {
    const hourClasses = classes.filter(cls => {
      const classDate = new Date(cls.start_time);
      const classHour = classDate.getHours().toString().padStart(2, '0') + ':00';
      return isSameDay(classDate, day) && classHour === hour;
    });

    return hourClasses.map((cls, index) => (
      <div 
        key={cls.id} 
        className="bg-primary/10 hover:bg-primary/20 p-1 rounded text-primary text-xs cursor-pointer"
        onClick={() => handleClassClick(cls)}
      >
        {cls.title} ({format(new Date(cls.start_time), 'HH:mm')})
      </div>
    ));
  };

  return (
    <div className="mx-auto p-4 container">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePreviousWeek} 
            className="btn btn-ghost btn-sm"
          >
            <CaretLeft />
          </button>
          <h2 className="font-semibold text-xl">
            {format(currentDate, 'MMMM yyyy')} - Week of {format(startOfWeek(currentDate), 'dd MMM')}
          </h2>
          <Button
            onClick={handleNextWeek}
            variant="ghost"
            size="icon"
          >
            <CaretRight />
          </Button>
        </div>
        <Button 
          onClick={() => {
            setSelectedDate(new Date());
            setIsModalOpen(true);
          }} 
          variant="default"
        >
          Schedule Class
        </Button>
      </div>

      {/* Weekly Grid */}
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
            {HOURS.map(hour => (
              <div 
                key={hour} 
                className="space-y-1 hover:bg-base-200 p-1 border-b h-12 cursor-pointer overflow-y-auto"
                onClick={() => handleDayClick(day)}
              >
                {renderClassesForDayAndHour(day, hour)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Class Modal */}
      <ClassModal
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