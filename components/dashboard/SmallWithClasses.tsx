"use client";

import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  MapPinIcon,
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
} from "date-fns";

type Event = {
  id: number;
  name: string;
  time: string;
  datetime: string;
  href: string;
  location: string;
  imageUrl: string;
};

const events: Event[] = [
  {
    id: 1,
    name: "Design review",
    time: "10AM",
    datetime: "2024-12-03T10:00",
    href: "#",
    location: "Main Office",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  // More mock events...
];

const generateDays = (currentMonth: Date): { date: string; isCurrentMonth: boolean; isToday: boolean; events: Event[] }[] => {
  const startDate = startOfWeek(startOfMonth(currentMonth));
  const endDate = endOfWeek(endOfMonth(currentMonth));

  const eventMap = events.reduce((map, event) => {
    const dateStr = format(parseISO(event.datetime), "yyyy-MM-dd");
    if (!map[dateStr]) map[dateStr] = [];
    map[dateStr].push(event);
    return map;
  }, {} as { [key: string]: Event[] });

  const days = [];
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

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const MonthView = (): JSX.Element => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const days = generateDays(currentMonth);

  const handleMonthChange = (offset: number) => setCurrentMonth((prev) => addMonths(prev, offset));

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900">Upcoming Meetings</h2>
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-16">
        {/* Calendar Section */}
        <div className="mt-10 text-center lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:mt-9 xl:col-start-9">
          <div className="flex items-center text-gray-900">
            <button
              type="button"
              onClick={() => handleMonthChange(-1)}
              className="-m-1.5 flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Previous month</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex-auto text-sm font-semibold">{format(currentMonth, "MMMM yyyy")}</div>
            <button
              type="button"
              onClick={() => handleMonthChange(1)}
              className="-m-1.5 flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Next month</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-7 text-xs font-medium text-gray-500">
            {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
            {days.map((day, idx) => (
              <button
                key={day.date}
                type="button"
                className={classNames(
                  "py-1.5 hover:bg-gray-100 focus:z-10",
                  day.isCurrentMonth ? "bg-white" : "bg-gray-50",
                  day.isToday && "text-indigo-600 font-bold",
                  idx === 0 && "rounded-tl-lg",
                  idx === 6 && "rounded-tr-lg",
                  idx === days.length - 7 && "rounded-bl-lg",
                  idx === days.length - 1 && "rounded-br-lg"
                )}
              >
                <time dateTime={day.date} className="mx-auto block text-center">
                  {day.date.split("-").pop()}
                </time>
              </button>
            ))}
          </div>
        </div>

        {/* Events List Section */}
        <ol className="mt-4 divide-y divide-gray-100 text-sm lg:col-span-7 xl:col-span-8">
          {events.map((event) => (
            <li key={event.id} className="relative flex gap-x-6 py-6">
              <img src={event.imageUrl} alt="" className="h-14 w-14 rounded-full" />
              <div className="flex-auto">
                <h3 className="font-semibold text-gray-900">{event.name}</h3>
                <dl className="mt-2 flex flex-col text-gray-500 xl:flex-row">
                  <div className="flex items-start gap-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    <dd>
                      <time dateTime={event.datetime}>
                        {format(new Date(event.datetime), "MMM d")} at {format(new Date(event.datetime), "h:mm a")}
                      </time>
                    </dd>
                  </div>
                  <div className="mt-2 flex items-start gap-x-3 xl:mt-0 xl:ml-4">
                    <MapPinIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    <dd>{event.location}</dd>
                  </div>
                </dl>
              </div>
              <div className="absolute right-0 top-6">
                <button className="-m-2 flex items-center rounded-full p-2 text-gray-500 hover:text-gray-600">
                  <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                <div className="absolute hidden right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5">
                  <div className="py-1">
                    <div>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Edit
                      </a>
                    </div>
                    <div>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Cancel
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default MonthView;
