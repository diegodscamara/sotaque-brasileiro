"use client";

import { Calendar, X } from "@phosphor-icons/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useSupabase } from "@/hooks/useSupabase";

type Package = {
  credits: number;
  scheduled_lessons: number;
  name: string;
};

export default function PackageInfo() {
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
        .from("users")
        .select("credits, scheduled_lessons, package_name")
        .eq("id", user.id)
        .single();

      setPackageData({
        credits: profile?.credits || 0,
        scheduled_lessons: profile?.scheduled_lessons || 0,
        name: profile?.package_name || "Unknown",
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setIsLoading(false);
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

      const studentsChannel = supabase.channel('students-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'students',
            filter: `id=eq.${user.id}`,
          },
          () => {
            fetchPackage();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(classesChannel);
        supabase.removeChannel(studentsChannel);
      };
    };

    const cleanup = setupSubscriptions();
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [supabase]);

  if (isLoading) {
    return (
      <Card className="rounded-md w-full h-full skeleton">
        <CardContent>
          <div className="flex flex-col justify-between gap-4">
            <div className="flex justify-between items-center py-4">
              <div>
                <div className="rounded w-32 h-6 skeleton"></div>
                <div className="mt-2 rounded w-16 h-4 skeleton"></div>
              </div>
              <div className="flex gap-2">
                <div className="rounded-md w-32 h-6 skeleton"></div>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-4 py-4">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="rounded w-1/4 h-4 skeleton"></div>
                  <div className="rounded w-16 h-6 skeleton"></div>
                </div>
                <div className="flex items-center rounded-full w-full h-2.5 skeleton"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="rounded w-1/4 h-4 skeleton"></div>
                <div className="rounded w-16 h-6 skeleton"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!packageData) return null;

  const scheduledLessons = packageData.scheduled_lessons || 0;
  const totalLessons = packageData.credits || 0;
  const progress = totalLessons > 0 ? (scheduledLessons / totalLessons) * 100 : 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center py-4">
            <div>
              <CardTitle className="font-semibold text-lg">{packageData.name}</CardTitle>
              <p className="text-muted-foreground text-sm">Portuguese</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsCalendarModalOpen(true)}
                variant="default"
              >
                <Calendar className="mr-2" /> Schedule Class
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col justify-between gap-4 py-4">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground text-sm">Scheduled Classes</p>
                <p className="font-semibold">
                  {scheduledLessons}/{totalLessons}
                </p>
              </div>
              <div className="flex items-center bg-base-200 rounded-full w-full">
                <div
                  className="bg-primary rounded-full h-2.5 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Modal */}
      {isCalendarModalOpen && (
        <div
          className="z-50 fixed inset-0 flex justify-center items-center bg-gray-800/50 m-0 h-[100vh]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCalendarModalOpen(false);
            }
          }}
        >
          <div className="bg-white shadow-xl rounded-lg w-[95%] max-w-[1200px] h-[90%] overflow-hidden">
            <div className="flex justify-between items-center bg-gray-200 p-4 border-b border-border">
              <h2 className="font-semibold text-xl">Schedule Classes</h2>
              <Button
                onClick={() => setIsCalendarModalOpen(false)}
                size="icon"
                variant="outline"
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
