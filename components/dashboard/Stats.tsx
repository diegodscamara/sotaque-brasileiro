"use client";

import { Clock, CreditCard, Trophy } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import Link from "next/link";
import { useSupabase } from "@/hooks/useSupabase";

export default function Stats() {
  const { supabase } = useSupabase();
  const [stats, setStats] = useState({
    credits: 0,
    scheduledClasses: 0,
    completedClasses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile for credits
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

      // Count scheduled classes
      const { count: scheduledCount } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .eq("student_id", user.id)
        .eq("status", "scheduled");

      // Count completed classes
      const { count: completedCount } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .eq("student_id", user.id)
        .eq("status", "completed");

      setStats({
        credits: profile?.credits || 0,
        scheduledClasses: scheduledCount || 0,
        completedClasses: completedCount || 0,
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();

    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const classesChannel = supabase.channel('stats-classes-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'classes',
            filter: `student_id=eq.${user.id}`,
          },
          () => {
            fetchStats();
          }
        )
        .subscribe();

      const profilesChannel = supabase.channel('stats-profiles-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          () => {
            fetchStats();
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

  if (isLoading) {
    return (
      <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
        <div className="flex flex-col justify-between shadow-md rounded-md skeleton">
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="p-3 rounded-lg w-12 h-12 skeleton"></div>
            <div>
              <p className="mb-2 rounded w-32 h-4 skeleton"></p>
              <p className="rounded w-1/2 h-6 skeleton"></p>
            </div>
          </div>
          <div className="flex px-6 py-4 rounded-b-md">
            <div className="rounded w-1/4 h-4 skeleton"></div>
          </div>
        </div>
        <div className="flex flex-col justify-between shadow-md rounded-md skeleton">
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="p-3 rounded-lg w-12 h-12 skeleton"></div>
            <div>
              <p className="mb-2 rounded w-32 h-4 skeleton"></p>
              <p className="rounded w-1/2 h-6 skeleton"></p>
            </div>
          </div>
          <div className="flex px-6 py-4 rounded-b-md">
            <div className="rounded w-1/4 h-4 skeleton"></div>
          </div>
        </div>
        <div className="flex flex-col justify-between shadow-md rounded-md skeleton">
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="p-3 rounded-lg w-12 h-12 skeleton"></div>
            <div>
              <p className="mb-2 rounded w-32 h-4 skeleton"></p>
              <p className="rounded w-1/2 h-6 skeleton"></p>
            </div>
          </div>
          <div className="flex px-6 py-4 rounded-b-md">
            <div className="rounded w-1/4 h-4 skeleton"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
      <div className="flex flex-col justify-between bg-white shadow-md rounded-md">
        <div className="flex items-center gap-4 px-6 py-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <CreditCard className="w-6 h-6 text-primary" weight="duotone" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Available Credits</p>
            <p className="font-semibold text-2xl">{stats.credits}</p>
          </div>
        </div>
        <div className="flex bg-gray-50 px-6 py-4 rounded-b-md">
          <Link href="/classes" className="text-primary link link-hover">Buy more credits</Link>
        </div>
      </div>

      <div className="flex flex-col justify-between bg-white shadow-md rounded-md">
        <div className="flex items-center gap-4 px-6 py-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Clock className="w-6 h-6 text-primary" weight="duotone" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Scheduled Classes</p>
            <p className="font-semibold text-2xl">{stats.scheduledClasses}</p>
          </div>
        </div>
        <div className="flex bg-gray-50 px-6 py-4 rounded-b-md">
          <Link href="/classes" className="text-primary link link-hover">View all</Link>
        </div>
      </div>

      <div className="flex flex-col justify-between bg-white shadow-md rounded-md">
        <div className="flex items-center gap-4 px-6 py-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Trophy className="w-6 h-6 text-primary" weight="duotone" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Completed Classes</p>
            <p className="font-semibold text-2xl">{stats.completedClasses}</p>
          </div>
        </div>
        <div className="flex bg-gray-50 px-6 py-4 rounded-b-md">
          <Link href="/classes" className="text-primary link link-hover">View all</Link>
        </div>
      </div>
    </div>
  );
}

