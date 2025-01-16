"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Class } from "@/types/class";
import { ClassModal } from "./ClassModal";
import { SelectItem } from "../ui/select";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import useClassApi from "@/hooks/useClassApi";

const LESSONS_PER_PAGE = 4; // Define the constant for lessons per page

const LessonsList = () => {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { classes, loading, error, fetchClasses, editClass, cancelClass } = useClassApi();
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelType, setCancelType] = useState<'single' | 'all'>('single');

  const filteredLessons = classes.filter(lesson =>
    statusFilter ? lesson.status === statusFilter : true
  );

  const totalPages = Math.ceil(filteredLessons.length / LESSONS_PER_PAGE); // Calculate total pages

  const indexOfLastLesson = currentPage * LESSONS_PER_PAGE; // Calculate the last lesson index
  const indexOfFirstLesson = indexOfLastLesson - LESSONS_PER_PAGE; // Calculate the first lesson index

  useEffect(() => {
    fetchClasses({});
  }, [fetchClasses]);

  const handleCancel = async (lesson: Class) => {
    setSelectedClass(lesson);
    setShowCancelDialog(true);
  };

  const confirmCancel = async () => {
    if (!selectedClass) return;

    try {
      await cancelClass(selectedClass.id);
      await fetchClasses({});
      toast.success("Class cancelled successfully");
    } catch (error) {
      console.error("Error cancelling class:", error);
      toast.error("Failed to cancel class");
    } finally {
      setShowCancelDialog(false);
    }
  };

  const handleReschedule = (lesson: Class) => {
    setSelectedClass(lesson);
    setIsClassModalOpen(true);
  };

  const handleEdit = (lesson: Class) => {
    setSelectedClass(lesson);
    setIsClassModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getPageNumbers = (currentPage: number, totalPages: number) => {
    const delta = 2; // Number of pages to show around the current page
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

  if (loading) {
    return <div>Loading...</div>; // Add a loading state
  }

  if (classes.length === 0) {
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
      {filteredLessons.slice(indexOfFirstLesson, indexOfLastLesson).map((lesson) => (
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
                    <DropdownMenuItem onClick={() => handleEdit(lesson)}>
                      Edit
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
                      variant="ghost"
                      size="icon"
                      className="ml-2 rounded-full"
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
        onClose={() => setIsClassModalOpen(false)}
        selectedDate={selectedClass?.start_time ? new Date(selectedClass.start_time) : new Date()}
        selectedClass={selectedClass || undefined}
        onClassUpdated={fetchClasses}
        mode={selectedClass ? 'edit' : 'schedule'}
      />

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelType === 'single'
                ? "This class is less than 24 hours away. Cancelling now will result in losing the credit."
                : "Do you want to cancel only this class or all future classes in the series?"
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Don&apos;t Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>
              {cancelType === 'single' ? "Cancel Anyway" : "Cancel This Class"}
            </AlertDialogAction>
            {cancelType === 'all' && (
              <AlertDialogAction
                onClick={() => {
                  setCancelType('all');
                  confirmCancel();
                }}
              >
                Cancel All Future Classes
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LessonsList;
