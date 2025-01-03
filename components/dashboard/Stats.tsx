"use client";

import { Clock, CreditCard, Trophy } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

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
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-md h-[104px] skeleton"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
      <div className="bg-white shadow-sm p-6 border rounded-md">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <CreditCard className="w-6 h-6 text-primary" weight="duotone" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Available Credits</p>
            <p className="font-semibold text-2xl">{stats.credits}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm p-6 border rounded-md">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Clock className="w-6 h-6 text-primary" weight="duotone" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Scheduled Classes</p>
            <p className="font-semibold text-2xl">{stats.scheduledClasses}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm p-6 border rounded-md">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Trophy className="w-6 h-6 text-primary" weight="duotone" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Completed Classes</p>
            <p className="font-semibold text-2xl">{stats.completedClasses}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

