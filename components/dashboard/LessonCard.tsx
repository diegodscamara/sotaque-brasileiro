"use client";

import { CalendarBlank, Clock, NotePencil } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { Class } from "@/types/class";
import { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/client";
import { format } from "date-fns";

const LessonCard = () => {
  const supabase = createClient();
  const [lessons, setLessons] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchLessons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: lessons, error } = await supabase
        .from("classes")
        .select("*")
        .eq("student_id", user.id)
        .eq("status", "scheduled")
        .order("start_time", { ascending: true });

      if (error) throw error;
      setLessons(lessons || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to changes
      const channel = supabase
        .channel('lessons_changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all changes
            schema: 'public',
            table: 'classes',
            filter: `student_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Change received!', payload);
            fetchLessons(); // Refresh the lessons when a change occurs
          }
        )
        .subscribe();

      setChannel(channel);
    };

    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 w-full">
        <div className="space-y-4 animate-pulse">
          <div className="bg-base-300 rounded w-1/4 h-4"></div>
          <div className="bg-base-300 rounded h-32"></div>
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="py-12 text-center">
        <CalendarBlank className="mx-auto w-12 h-12 text-base-content/70" />
        <h3 className="mt-2 font-semibold text-sm">No lessons scheduled</h3>
        <p className="mt-1 text-base-content/70 text-sm">
          Get started by scheduling your first lesson.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-base-200">
      {lessons.map((lesson) => (
        <div key={lesson.id} className="hover:bg-base-200/50 p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-base">{lesson.title}</h3>
              <div className="space-y-1 mt-1">
                <div className="flex items-center text-base-content/70 text-sm">
                  <Clock className="flex-shrink-0 mr-1.5 w-4 h-4" />
                  <time dateTime={lesson.start_time}>
                    {format(new Date(lesson.start_time), "EEEE, MMMM d, yyyy")}
                  </time>
                  <span className="mx-1">•</span>
                  <span>
                    {format(new Date(lesson.start_time), "h:mm a")} - {format(new Date(lesson.end_time), "h:mm a")}
                  </span>
                </div>
                {lesson.notes && (
                  <div className="flex items-start text-base-content/70 text-sm">
                    <NotePencil className="flex-shrink-0 mt-0.5 mr-1.5 w-4 h-4" />
                    <span>{lesson.notes}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="ml-4">
              <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                  lesson.recurring_group_id
                    ? "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10"
                    : "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10"
                }`}
              >
                {lesson.recurring_group_id ? "Recurring" : "One-time"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LessonCard;
