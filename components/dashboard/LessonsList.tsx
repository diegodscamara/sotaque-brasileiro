"use client";

import { Calendar, CalendarBlank, CaretLeft, CaretRight, DotsThreeVertical, FunnelSimple, NotePencil, X } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectTrigger } from "../ui/select";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import CancelDialog from "./class-modal/CancelDialog";
import { Class } from "@/types/class";
import { ClassModal } from "./ClassModal";
import { RealtimeChannel } from "@supabase/supabase-js";
import { SelectItem } from "../ui/select";
import { cancelClass } from "@/libs/utils/classActions";
import { createClient } from "@/libs/supabase/client";
import { format } from "date-fns";

const LessonsList = () => {
  const supabase = createClient();
  const [lessons, setLessons] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const LESSONS_PER_PAGE = 4;
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [futureLessons, setFutureLessons] = useState<Class[]>([]);

  const fetchLessons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: lessons, error } = await supabase
        .from("classes")
        .select("*")
        .eq("student_id", user.id)
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
  const filteredLessons = lessons.filter(lesson =>
    statusFilter ? lesson.status === statusFilter : true
  );
  const currentLessons = filteredLessons.slice(indexOfFirstLesson, indexOfLastLesson);
  const totalPages = Math.ceil(filteredLessons.length / LESSONS_PER_PAGE);

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

  const getPageNumbers = (currentPage: number, totalPages: number) => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const openClassModal = (lesson: Class) => {
    setSelectedClass(lesson);
    setIsClassModalOpen(true);
  };

  const closeClassModal = () => {
    setSelectedClass(null);
    setIsClassModalOpen(false);
  };

  const handleReschedule = (lesson: Class) => {
    if (lesson.status === 'completed' || lesson.status === 'cancelled') {
      return;
    }
    openClassModal(lesson);
  };

  const handleCancel = async (lesson: Class) => {
    if (lesson.status === 'completed' || lesson.status === 'cancelled') {
      return;
    }

    setSelectedClass(lesson);

    if (lesson.recurring_group_id) {
      // Check if the selected class is the last one in the series
      const { data: lessons, error: selectError } = await supabase
        .from("classes")
        .select("*")
        .eq("recurring_group_id", lesson.recurring_group_id)
        .gt("start_time", lesson.start_time);

      if (selectError) {
        console.error("Error fetching future lessons:", selectError);
        return;
      }

      setFutureLessons(lessons);

      if (lessons.length === 0) {
        // If it's the last class, cancel it directly
        try {
          await cancelClass('single', lesson);
          fetchLessons();
        } catch (error) {
          console.error("Error cancelling class:", error);
        }
      } else {
        // If it's not the last class, open the CancelDialog
        setShowCancelDialog(true);
      }
    } else {
      try {
        await cancelClass('single', lesson);
        fetchLessons();
      } catch (error) {
        console.error("Error cancelling class:", error);
      }
    }
  };

  const confirmCancel = async (cancelType: 'single' | 'all') => {
    if (!selectedClass) return;

    try {
      await cancelClass(cancelType, selectedClass);
      fetchLessons();
    } catch (error) {
      console.error("Error cancelling class:", error);
    } finally {
      setShowCancelDialog(false);
    }
  };

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
        <h3 className="mt-2 font-semibold text-sm">No classes scheduled</h3>
        <p className="mt-1 text-base-content/70 text-sm">
          Get started by scheduling your first class.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white shadow-md px-6 rounded-md divide-y divide">
      <div className="flex justify-between items-center py-4">
        <h2 className="font-semibold text-lg">Classes List</h2>
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => {
            setStatusFilter(value === "all" ? null : value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <FunnelSimple className="w-4 h-4" />
            {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : 'All Classes'}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {currentLessons.map((lesson) => (
        <div key={lesson.id} className="py-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-base">{lesson.title}</h3>
              <div className="space-y-1 mt-1">
                <div className="flex items-center text-base-content/70 text-sm">
                  <Calendar className="flex-shrink-0 mr-1.5 w-4 h-4" />
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
            <div className="flex items-center gap-2 ml-4">
              <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${lesson.status === "scheduled"
                  ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-700/10"
                  : lesson.status === "completed"
                    ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10"
                    : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-700/10"
                  }`}
              >
                {lesson.status.charAt(0).toUpperCase() + lesson.status.slice(1)}
              </span>
              {lesson.status !== 'completed' && lesson.status !== 'cancelled' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <DotsThreeVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40">
                    <DropdownMenuItem onClick={() => handleReschedule(lesson)}>
                      Reschedule
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCancel(lesson)}>
                      Cancel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {filteredLessons.length > LESSONS_PER_PAGE && (
        <div className="flex justify-between items-center border-gray-200 bg-white py-4 border-t">
          <div className="sm:flex flex-wrap sm:flex-1 sm:justify-between sm:items-center gap-2 hidden">
            <div>
              <p className="text-gray-700 text-sm">
                Showing{' '}
                <span className="font-bold">{indexOfFirstLesson + 1}</span>{' '}
                to{' '}
                <span className="font-bold">
                  {Math.min(indexOfLastLesson, filteredLessons.length)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{filteredLessons.length}</span>{' '}
                lessons
                {statusFilter && (
                  <span className="ml-2">
                    filtered by{' '}
                    <span className="font-medium">
                      {statusFilter}
                    </span>
                    <Button
                      onClick={() => {
                        setStatusFilter(null);
                        setCurrentPage(1);
                      }}
                      variant="outline"
                    >
                      <X className="inline w-4 h-4" />
                    </Button>
                  </span>
                )}
              </p>
            </div>
            <div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    {currentPage === 1 ? (
                      <span className="cursor-not-allowed">
                        <CaretLeft className="w-5 h-5 text-gray-400" />
                      </span>
                    ) : (
                      <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                    )}
                  </PaginationItem>
                  {getPageNumbers(currentPage, totalPages).map((pageNumber, index) => (
                    pageNumber === '...' ? (
                      <PaginationItem key={`dots-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={index}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNumber as number)}
                          isActive={pageNumber === currentPage}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  ))}
                  <PaginationItem>
                    {currentPage === totalPages ? (
                      <span className="cursor-not-allowed">
                        <CaretRight className="w-5 h-5 text-gray-400" />
                      </span>
                    ) : (
                      <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                    )}
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>

          {/* Mobile pagination */}
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="default"
            >
              Previous
            </Button>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="default"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <ClassModal
        isOpen={isClassModalOpen}
        onClose={closeClassModal}
        selectedDate={selectedClass?.start_time ? new Date(selectedClass.start_time) : new Date()}
        selectedClass={selectedClass || undefined}
        onClassUpdated={fetchLessons}
      />

      <CancelDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onSubmit={confirmCancel}
        isSubmitting={false}
        isRecurring={!!selectedClass?.recurring_group_id}
        isLastInSeries={futureLessons.length === 0}
      />
    </div>
  );
};

export default LessonsList;
