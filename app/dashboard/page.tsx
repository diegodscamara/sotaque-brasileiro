"use client";

import LessonsList from "@/components/dashboard/LessonsList";
import Package from "@/components/dashboard/Package";
import Stats from "@/components/dashboard/Stats";
import Summary from "@/components/dashboard/Summary";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <Stats />
      <div className="flex lg:flex-row flex-col gap-6">
        <div className="flex flex-col gap-6 w-full">
          <Summary />
          <Package />
        </div>
        <div className="w-full">
          <LessonsList />
        </div>
      </div>
    </div>
  );
}
