"use client";

import { CalendarBlank, CaretLeft, CaretRight, Clock, NotePencil } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { Class } from "@/types/class";
import { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/client";
import { format } from "date-fns";

const LessonsList = () => {
  const supabase = createClient();
  const [lessons, setLessons] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const LESSONS_PER_PAGE = 4;

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

  // Pagination logic
  const indexOfLastLesson = currentPage * LESSONS_PER_PAGE;
  const indexOfFirstLesson = indexOfLastLesson - LESSONS_PER_PAGE;
  const currentLessons = lessons.slice(indexOfFirstLesson, indexOfLastLesson);
  const totalPages = Math.ceil(lessons.length / LESSONS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
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
  }, [lessons]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 shadow-sm p-6 border rounded-md divide-y animate-pulse skeleton">
        <div className="rounded w-full h-6 skeleton"></div>
        <div className="py-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="mt-2 rounded w-1/2 h-4 skeleton"></div>
              <div className="space-y-1 mt-1">
                <div className="flex items-center">
                  <div className="mr-1.5 rounded w-4 h-4 skeleton"></div>
                  <div className="mr-1 rounded w-1/2 h-4 skeleton"></div>
                </div>
                <div className="flex items-start">
                  <div className="mt-0.5 mr-1.5 rounded w-4 h-4 skeleton"></div>
                  <div className="rounded w-1/2 h-4 skeleton"></div>
                </div>
              </div>
            </div>
            <div className="ml-4">
              <div className="inline-flex items-center px-2 py-1 rounded-md w-24 h-4 skeleton">
              </div>
            </div>
          </div>
        </div>
        <div className="py-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="mt-2 rounded w-1/2 h-4 skeleton"></div>
              <div className="space-y-1 mt-1">
                <div className="flex items-center text-base-content/70 text-sm">
                  <div className="mr-1.5 rounded w-4 h-4 skeleton"></div>
                  <div className="mr-1 rounded w-1/2 h-4 skeleton"></div>
                </div>
                <div className="flex items-start text-base-content/70 text-sm">
                  <div className="mt-0.5 mr-1.5 rounded w-4 h-4 skeleton"></div>
                  <div className="rounded w-1/2 h-4 skeleton"></div>
                </div>
              </div>
            </div>
            <div className="ml-4">
              <div className="inline-flex items-center px-2 py-1 rounded-md ring-inset w-24 h-4 font-medium skeleton">
              </div>
            </div>
          </div>
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
    <div className="flex flex-col gap-4 bg-white shadow-sm p-6 border rounded-md divide-y divide">
      <h2 className="font-semibold text-lg">Lessons List</h2>
      {currentLessons.map((lesson) => (
        <div key={lesson.id} className="py-4">
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
                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${lesson.recurring_group_id
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

      {/* Pagination */}
      {lessons.length > LESSONS_PER_PAGE && (
        <div className="flex justify-between items-center border-gray-200 bg-white py-3 border-t">
          <div className="sm:flex sm:flex-1 sm:justify-between sm:items-center hidden">
            <div>
              <p className="text-gray-700 text-sm">
                Showing{' '}
                <span className="font-medium">{indexOfFirstLesson + 1}</span>{' '}
                to{' '}
                <span className="font-medium">{Math.min(indexOfLastLesson, lessons.length)}</span>{' '}
                of{' '}
                <span className="font-medium">{lessons.length}</span>{' '}
                lessons
              </p>
            </div>
            <div>
              <nav aria-label="Pagination" className="inline-flex -space-x-px shadow-sm rounded-md isolate">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex relative focus:z-20 items-center hover:bg-gray-50 disabled:opacity-50 px-2 py-2 rounded-l-md ring-1 ring-gray-300 ring-inset text-gray-400 disabled:cursor-not-allowed focus:outline-offset-0"
                >
                  <span className="sr-only">Previous</span>
                  <CaretLeft aria-hidden="true" className="w-5 h-5" />
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`
                      relative inline-flex items-center px-4 py-2 text-sm font-semibold 
                      ${currentPage === index + 1 
                        ? 'bg-primary text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }
                    `}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex relative focus:z-20 items-center hover:bg-gray-50 disabled:opacity-50 px-2 py-2 rounded-r-md ring-1 ring-gray-300 ring-inset text-gray-400 disabled:cursor-not-allowed focus:outline-offset-0"
                >
                  <span className="sr-only">Next</span>
                  <CaretRight aria-hidden="true" className="w-5 h-5" />
                </button>
              </nav>
            </div>
          </div>

          {/* Mobile pagination */}
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex relative items-center border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 px-4 py-2 border rounded-md font-medium text-gray-700 text-sm disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex relative items-center border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 ml-3 px-4 py-2 border rounded-md font-medium text-gray-700 text-sm disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonsList;
