import Breadcrumb from "@/components/Breadcrumb";
import LessonCard from "@/components/dashboard/LessonCard";
import MonthCalendar from "@/components/dashboard/MonthCalendar";
import Package from "@/components/dashboard/Package";
import Stats from "@/components/dashboard/Stats";
import Summary from "@/components/dashboard/Summary";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  return (
    <main className="container flex flex-col gap-6 p-8 mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Main Section */}
      <section className="flex flex-col gap-6">
        {/* Top: Stats */}
        <div className="xl:col-span-2">
          <Stats />
        </div>

        {/* Left: Summary and Package */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="xl:col-span-1">
            <Summary />
          </div>
          <div className="xl:col-span-1">
            <Package />
          </div>
        </div>

        {/* Right: Packages and LessonCard */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
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
