"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CreditCard, Trophy } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import Link from "next/link";
import React from "react";
import { useSupabase } from "@/hooks/useSupabase";

const cardConfigs: CardConfig[] = [
  {
    icon: <CreditCard className="w-6 h-6 text-primary" weight="duotone" />,
    title: "Available Credits",
    statKey: "credits",
    link: "/classes",
    linkText: "Buy more credits",
  },
  {
    icon: <Clock className="w-6 h-6 text-primary" weight="duotone" />,
    title: "Scheduled Classes",
    statKey: "scheduledClasses",
    link: "/classes",
    linkText: "View all",
  },
  {
    icon: <Trophy className="w-6 h-6 text-primary" weight="duotone" />,
    title: "Completed Classes",
    statKey: "completedClasses",
    link: "/classes",
    linkText: "View all",
  },
];

type CardConfig = {
  icon: React.ReactNode;
  title: string;
  statKey: keyof DashboardStats;
  link: string;
  linkText: string;
};

type DashboardStats = {
  credits: number;
  scheduledClasses: number;
  completedClasses: number;
};

function StatsCard({
  config,
  isLoading,
  dashboardStats,
}: {
  config: CardConfig;
  isLoading: boolean;
  dashboardStats: DashboardStats;
}) {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-lg">{config.icon}</div>
        <div>
          <p className="text-muted-foreground text-sm">{config.title}</p>
          <div className="rounded w-1/2 h-6 skeleton">
            {isLoading ? (
              <p className="font-semibold text-2xl" />
            ) : (
              dashboardStats[config.statKey]
            )}
          </div>
        </div>
      </CardHeader>
      <CardFooter>
        <Button asChild variant="outline">
          <Link href={config.link}>{config.linkText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function Stats() {
  const { supabase } = useSupabase();
  const [dashboardStats, setDashboardStats] = useState({
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
        .from("users")
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

      setDashboardStats({
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

      const studentsChannel = supabase.channel('stats-students-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'students',
            filter: `id=eq.${user.id}`,
          },
          () => {
            fetchStats();
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

  return (
    <>
      {cardConfigs.map((config) => (
        <StatsCard
          key={config.title}
          config={config}
          isLoading={isLoading}
          dashboardStats={dashboardStats}
        />
      ))}
    </>
  );
}

