"use client";

import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Clock, CreditCard, Trophy } from "@phosphor-icons/react";
import { useEffect, useState, useCallback } from "react";

import { Button } from "../ui/button";
import Link from "next/link";
import React from "react";
import { createClient } from "@/libs/supabase/client";
import { getStudent } from "@/app/actions/students";
import { fetchClasses } from "@/app/actions/classes";

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
  const value = dashboardStats[config.statKey];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          {config.icon}
          <h3 className="font-medium text-sm">{config.title}</h3>
        </div>
      </CardHeader>
      <div className="p-6 pt-0">
        {isLoading ? (
          <div className="bg-muted rounded w-24 h-8 animate-pulse"></div>
        ) : (
          <div className="font-bold text-2xl">{value}</div>
        )}
      </div>
      <CardFooter className="bg-muted/50 p-2 border-t">
        <Link href={config.link} className="w-full">
          <Button variant="ghost" className="justify-center w-full">
            {config.linkText}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function Stats() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    credits: 0,
    scheduledClasses: 0,
    completedClasses: 0,
  });
  const supabase = createClient();

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      // Fetch student data to get credits
      const studentData = await getStudent(user.id);
      
      // Fetch classes to count scheduled and completed
      const classesResult = await fetchClasses({});
      const classes = classesResult.data || [];
      
      // Use type assertion to avoid type errors
      const scheduledClasses = classes.filter(
        (c) => (c.status as string).toLowerCase() === 'scheduled' || (c.status as string).toLowerCase() === 'pending'
      ).length;
      
      const completedClasses = classes.filter(
        (c) => (c.status as string).toLowerCase() === 'completed'
      ).length;

      setDashboardStats({
        credits: studentData?.credits || 0,
        scheduledClasses,
        completedClasses,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchStats();

    // Set up real-time subscriptions
    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Subscribe to changes in the student table
      const studentSubscription = supabase
        .channel('student-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'students',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchStats();
          }
        )
        .subscribe();

      // Subscribe to changes in the classes table
      const classesSubscription = supabase
        .channel('classes-changes')
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

      // Cleanup function
      return () => {
        studentSubscription.unsubscribe();
        classesSubscription.unsubscribe();
      };
    };

    const cleanup = setupSubscriptions();
    return () => {
      cleanup.then(unsub => {
        if (unsub) unsub();
      });
    };
  }, [fetchStats, supabase]);

  return (
    <>
      {cardConfigs.map((config) => (
        <StatsCard
          key={config.statKey}
          config={config}
          isLoading={isLoading}
          dashboardStats={dashboardStats}
        />
      ))}
    </>
  );
}

