"use client";

import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  MapPinIcon,
} from "@heroicons/react/20/solid";
import React, { JSX, useState } from "react";
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

import Image from "next/image";

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
      <h2 className="font-semibold text-base text-gray-900">Upcoming Meetings</h2>
      <div className="lg:gap-x-16 lg:grid lg:grid-cols-12">
        {/* Calendar Section */}
        <div className="lg:col-start-8 xl:col-start-9 lg:col-end-13 lg:row-start-1 mt-10 lg:mt-9 text-center">
          <div className="flex items-center text-gray-900">
            <button
              type="button"
              onClick={() => handleMonthChange(-1)}
              className="flex justify-center items-center -m-1.5 p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Previous month</span>
              <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
            </button>
            <div className="flex-auto font-semibold text-sm">{format(currentMonth, "MMMM yyyy")}</div>
            <button
              type="button"
              onClick={() => handleMonthChange(1)}
              className="flex justify-center items-center -m-1.5 p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Next month</span>
              <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 mt-6 font-medium text-gray-500 text-xs">
            {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="gap-px grid grid-cols-7 bg-gray-200 shadow mt-2 rounded-lg ring-1 ring-gray-200 text-sm isolate">
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
                <time dateTime={day.date} className="block mx-auto text-center">
                  {day.date.split("-").pop()}
                </time>
              </button>
            ))}
          </div>
        </div>

        {/* Events List Section */}
        <ol className="lg:col-span-7 xl:col-span-8 mt-4 divide-y divide-gray-100 text-sm">
          {events.map((event) => (
            <li key={event.id} className="relative flex gap-x-6 py-6">
              <Image src={event.imageUrl} alt="" className="rounded-full w-14 h-14" width={56} height={56} />
              <div className="flex-auto">
                <h3 className="font-semibold text-gray-900">{event.name}</h3>
                <dl className="flex xl:flex-row flex-col mt-2 text-gray-500">
                  <div className="flex items-start gap-x-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                    <dd>
                      <time dateTime={event.datetime}>
                        {format(new Date(event.datetime), "MMM d")} at {format(new Date(event.datetime), "h:mm a")}
                      </time>
                    </dd>
                  </div>
                  <div className="flex items-start gap-x-3 mt-2 xl:mt-0 xl:ml-4">
                    <MapPinIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                    <dd>{event.location}</dd>
                  </div>
                </dl>
              </div>
              <div className="top-6 right-0 absolute">
                <button className="flex items-center -m-2 p-2 rounded-full text-gray-500 hover:text-gray-600">
                  <EllipsisHorizontalIcon className="w-5 h-5" aria-hidden="true" />
                </button>
                <div className="right-0 z-10 absolute hidden bg-white shadow-lg mt-2 rounded-md ring-1 ring-black/5 w-36 origin-top-right">
                  <div className="py-1">
                    <div>
                      <a href="#" className="block hover:bg-gray-100 px-4 py-2 text-gray-700 text-sm">
                        Edit
                      </a>
                    </div>
                    <div>
                      <a href="#" className="block hover:bg-gray-100 px-4 py-2 text-gray-700 text-sm">
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
