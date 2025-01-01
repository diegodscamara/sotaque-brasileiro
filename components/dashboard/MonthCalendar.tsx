"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
import React, { useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

// Event and Day types
type Event = {
  id: number;
  name: string;
  time: string;
  datetime: string;
  href: string;
};

type Day = {
  date: string;
  isCurrentMonth?: boolean;
  isToday?: boolean;
  events: Event[];
};

// Mock data
const events: Event[] = [
  { id: 1, name: "Design review", time: "10AM", datetime: "2024-12-03T10:00", href: "#" },
  { id: 2, name: "Sales meeting", time: "2PM", datetime: "2024-12-03T14:00", href: "#" },
  { id: 3, name: "Date night", time: "6PM", datetime: "2024-12-07T18:00", href: "#" },
  { id: 4, name: "Maple syrup museum", time: "3PM", datetime: "2024-12-22T15:00", href: "#" },
  { id: 5, name: "Hockey game", time: "7PM", datetime: "2024-12-22T19:00", href: "#" },
  { id: 6, name: "Sam's birthday party", time: "2PM", datetime: "2024-12-12T14:00", href: "#" },
  { id: 7, name: "Cinema with friends", time: "9PM", datetime: "2024-12-04T21:00", href: "#" },
];

// Generate calendar days
const generateDays = (currentMonth: Date): Day[] => {
  const startDate = startOfWeek(startOfMonth(currentMonth));
  const endDate = endOfWeek(endOfMonth(currentMonth));

  const eventMap = events.reduce((map, event) => {
    const dateStr = format(parseISO(event.datetime), "yyyy-MM-dd");
    if (!map[dateStr]) map[dateStr] = [];
    map[dateStr].push(event);
    return map;
  }, {} as { [key: string]: Event[] });

  const days: Day[] = [];
  let day = startDate;
  while (day <= endDate) {
    const dateStr = format(day, "yyyy-MM-dd");
    days.push({
      date: dateStr,
      isCurrentMonth: isSameMonth(day, currentMonth),
      isToday: isSameDay(day, new Date()),
      events: eventMap[dateStr] || [],
    });
    day = addDays(day, 1);
  }

  return days;
};

const MonthView = (): JSX.Element => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const days = generateDays(currentMonth);

  const handleMonthChange = (offset: number) => {
    setCurrentMonth((prev) => addMonths(prev, offset));
  };

  return (
    <div className="rounded-md lg:flex lg:h-full lg:flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white ring-1 ring-gray-900/5 rounded-t-md">
        <h1 className="text-base font-semibold text-gray-900">
          <time dateTime={format(currentMonth, "yyyy-MM")}>{format(currentMonth, "MMMM yyyy")}</time>
        </h1>
        <div className="flex items-center gap-4">
          {/* Navigation Buttons */}
          <div className="flex items-center">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => handleMonthChange(-1)}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => handleMonthChange(1)}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
          {/* Booking Button */}
          <button type="button" className="btn btn-sm btn-primary">
            Book now
          </button>
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="shadow ring-1 ring-black/5 lg:flex lg:flex-auto lg:flex-col">
        {/* Days of the Week */}
        <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold text-gray-700 lg:flex-none">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="bg-white py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days of the Month */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 text-xs text-gray-700 lg:flex-auto">
          {days.map((day) => (
            <div
              key={day.date}
              className={`relative p-3 ${
                day.isToday
                  ? "bg-primary text-white"
                  : day.isCurrentMonth
                  ? "bg-white"
                  : "bg-gray-50 text-gray-500"
              }`}
            >
              <time
                dateTime={day.date}
                className={`block text-sm font-semibold ${
                  day.isToday ? "rounded-full bg-primary p-1" : ""
                }`}
              >
                {day.date.split("-").pop()}
              </time>
              {/* Events */}
              {day.events.length > 0 && (
                <ol className="mt-2 space-y-1">
                  {day.events.slice(0, 2).map((event) => (
                    <li key={event.id} className="flex">
                      <a
                        href={event.href}
                        className="flex-auto truncate text-gray-900 hover:text-primary"
                      >
                        {event.name}
                      </a>
                      <time
                        dateTime={event.datetime}
                        className="ml-2 text-gray-500"
                      >
                        {event.time}
                      </time>
                    </li>
                  ))}
                  {day.events.length > 2 && (
                    <li className="text-gray-500">+{day.events.length - 2} more</li>
                  )}
                </ol>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthView;
