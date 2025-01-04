"use client";

import { Calendar, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { MonthCalendar } from "./calendar/Calendar";
import { enUS } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import { useSupabase } from "@/hooks/useSupabase";

type Package = {
  credits: number;
  expiresIn: string | null;
  scheduled_lessons: number;
  package_expiration: string | null;
};

export default function Package() {
  const { supabase } = useSupabase();
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const fetchPackage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile for credits
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits, package_expiration, scheduled_lessons")
        .eq("id", user.id)
        .single();

      setPackageData({
        credits: profile?.credits || 0,
        scheduled_lessons: profile?.scheduled_lessons || 0,
        package_expiration: profile?.package_expiration,
        expiresIn: profile?.package_expiration ? formatDistanceToNow(new Date(profile.package_expiration), {
          addSuffix: true,
          locale: enUS,
        }) : null
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchPackage();

    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const classesChannel = supabase.channel('classes-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'classes',
            filter: `student_id=eq.${user.id}`,
          },
          () => {
            fetchPackage();
          }
        )
        .subscribe();

      const profilesChannel = supabase.channel('profiles-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          () => {
            fetchPackage();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(classesChannel);
        supabase.removeChannel(profilesChannel);
      };
    };

    const cleanup = setupSubscriptions();
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [supabase]);


  if (!packageData) return null;

  const scheduledLessons = packageData.scheduled_lessons || 0;
  const totalLessons = packageData.credits || 0;
  const expiresIn = packageData.package_expiration
    ? formatDistanceToNow(new Date(packageData.package_expiration), {
      addSuffix: true,
      locale: enUS,
    })
    : "Not available";
  const progress = totalLessons > 0 ? (scheduledLessons / totalLessons) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-between gap-4 shadow-sm p-6 border rounded-lg h-fit divide skeleton">
        <div className="skeletonflex justify-between items-center">
          <div>
            <div className="rounded w-1/3 h-6 skeleton"></div>
            <div className="mt-1 rounded w-1/5 h-5 skeleton"></div>
          </div>
          <div className="flex gap-2 skeleton">
            <div className="rounded w-24 h-10 skeleton"></div>
          </div>
        </div>

        <div className="divider skeleton"></div>

        <div className="flex flex-col gap-4 skeleton">
          <div className="flex flex-col gap-1 skeleton">
            <div className="flex justify-between items-center skeleton">
              <div className="rounded w-1/3 h-5 skeleton"></div>
              <div className="rounded w-1/4 h-5 skeleton"></div>
            </div>
            <div className="bg-secondary rounded-full w-full h-2.5 skeleton">
              <div className="bg-primary rounded-full h-2.5 skeleton"></div>
            </div>
          </div>
          <div className="flex justify-between items-center skeleton">
            <div className="rounded w-1/4 h-5 skeleton"></div>
            <div className="rounded w-1/5 h-5 skeleton"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-4 bg-white shadow-sm p-6 border rounded-md h-fit divide">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-lg">
              Lesson Package
            </h2>
            <p className="text-muted-foreground text-sm">
              Portuguese
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="text-base-200 btn btn-primary btn-sm"
            >
              <Calendar className="mr-2" /> Schedule Class
            </button>
          </div>
        </div>

        <div className="divider"></div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground text-sm">Scheduled Lessons</p>
              <p className="font-semibold">
                {scheduledLessons}/{totalLessons}
              </p>
            </div>
            <div className="bg-base-200 rounded-full w-full h-2.5">
              <div
                className="bg-primary rounded-full h-2.5 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-sm">Expires</p>
            <p className="font-semibold">{expiresIn}</p>
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      {isCalendarModalOpen && (
        <div
          className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 m-0 h-[100vh]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCalendarModalOpen(false);
            }
          }}
        >
          <div className="bg-white shadow-xl rounded-lg w-[95%] max-w-[1200px] h-[90%] overflow-hidden">
            <div className="flex justify-between items-center bg-primary p-4 border-b">
              <h2 className="font-semibold text-xl">Schedule Classes</h2>
              <button
                onClick={() => setIsCalendarModalOpen(false)}
                className="text-primary-content btn btn-outline btn-sm btn-square">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-[calc(100%-60px)] overflow-auto">
              <MonthCalendar />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
