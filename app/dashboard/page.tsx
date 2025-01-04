"use client";

import LessonsList from "@/components/dashboard/LessonsList";
import Package from "@/components/dashboard/Package";
import Stats from "@/components/dashboard/Stats";
import Summary from "@/components/dashboard/Summary";

export default function Dashboard() {
  return (
    <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
      <div className="md:col-span-2">
        <Stats />
      </div>
      <div className="gap-6 grid grid-cols-1 md:col-span-1">
        <div className="md:col-span-1">
          <Summary />
        </div>
        <div className="md:col-span-1">
          <Package />
        </div>
      </div>
      <div className="md:col-span-1">
        <LessonsList />
      </div>
    </div>
  );
}
