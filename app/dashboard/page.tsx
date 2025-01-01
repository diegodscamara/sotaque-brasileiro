import Breadcrumb from "@/components/Breadcrumb";
import LessonCard from "@/components/dashboard/LessonCard";
import MonthView from "@/components/dashboard/SmallWithClasses";
import Package from "@/components/dashboard/Package";
import Status from "@/components/dashboard/Status";
import Summary from "@/components/dashboard/Summary";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  return (
    <main className="container flex flex-col gap-6 p-8 mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Main Section */}
      <section className="flex flex-col gap-6">
        {/* Top: Status */}
        <div className="xl:col-span-2">
          <Status />
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
        <div className="flex flex-col gap-6">
          <MonthView />
        </div>
      </section>
    </main>
  );
}