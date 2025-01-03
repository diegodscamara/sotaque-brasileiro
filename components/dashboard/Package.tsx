"use client";

import { useEffect, useState } from "react";

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
      <div className="h-full skeleton">
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between gap-4 bg-white shadow-sm p-6 border rounded-lg h-full divide">
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
          <div className="bg-secondary rounded-full w-full h-2.5">
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
  );
}
