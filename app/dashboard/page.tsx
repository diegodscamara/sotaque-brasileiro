import Breadcrumb from "@/components/Breadcrumb";
import LessonCard from "@/components/dashboard/LessonCard";
import { MonthCalendar } from "@/components/dashboard/calendar/MonthlyView";
import Package from "@/components/dashboard/Package";
import Stats from "@/components/dashboard/Stats";
import Summary from "@/components/dashboard/Summary";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  return (
    <main className="flex flex-col gap-6 mx-auto p-8 container">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Main Section */}
      <section className="flex flex-col gap-6">
        {/* Top: Stats */}
        <div className="xl:col-span-2">
          <Stats />
        </div>

        {/* Left: Summary and Package */}
        <div className="gap-6 grid grid-cols-1 xl:grid-cols-2">
          <div className="xl:col-span-1">
            <Summary />
          </div>
          <div className="xl:col-span-1">
            <Package />
          </div>
        </div>

        {/* Right: Packages and LessonCard */}
        <div className="gap-6 grid grid-cols-1 xl:grid-cols-2">
          <div className="xl:col-span-1">
            <LessonCard />
          </div>
          <div className="xl:col-span-1">
            <MonthCalendar />
          </div>
        </div>
      </section>
    </main>
  );
}
