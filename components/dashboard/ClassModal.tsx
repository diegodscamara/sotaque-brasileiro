"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { CheckCircleIcon, ClockIcon, Loader2, VideoIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import DOMPurify from 'dompurify';
import { DatePickerTimeExample } from "./date-picker";
import React from "react";
import { Textarea } from "../ui/textarea";
import { scheduleClass, editClass, cancelClass } from '@/app/actions/classes';
import { getTeacher } from '@/app/actions/teachers';
import { useToast } from "@/hooks/use-toast"

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'schedule';
  existingStartTime?: Date | undefined;
  classId?: string | undefined;
}

/**
 * ClassModal component for scheduling and editing classes
 * @param {ClassModalProps} props - Component props
 */
export const ClassModal = ({
  isOpen,
  onClose,
  mode,
  existingStartTime,
  classId
}: ClassModalProps) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(existingStartTime || new Date());
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [teacher, setTeacher] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (existingStartTime) {
      setSelectedDate(existingStartTime);
    }
  }, [existingStartTime]);

  useEffect(() => {
    const fetchTeacher = async () => {
      setIsLoading(true);
      try {
        const teacherData = await getTeacher("1"); // Replace with dynamic teacher ID when available
        setTeacher(teacherData);
      } catch (error) {
        console.error("Error fetching teacher:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacher();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedDate) {
      toast({
        title: "Please select a date and time",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Calculate end time (1 hour after start time)
      const endDate = new Date(selectedDate);
      endDate.setHours(endDate.getHours() + 1);

      // Sanitize notes input
      const sanitizedNotes = DOMPurify.sanitize(notes);

      // Calculate duration in minutes
      const durationInMinutes = 60; // 1 hour class

      // Create a partial class data object with only the fields needed for the API
      const classData = {
        teacherId: teacher?.id || "1",
        studentId: "1", // Replace with actual student ID when available
        status: "PENDING" as const,
        startDateTime: selectedDate,
        endDateTime: endDate,
        duration: durationInMinutes,
        notes: sanitizedNotes || undefined
      };

      if (mode === 'schedule') {
        // @ts-ignore - The server will validate the data
        await scheduleClass(classData);
        toast({
          title: "Class scheduled successfully",
          variant: "default",
        });
      } else if (mode === 'edit' && classId) {
        // @ts-ignore - The server will validate the data
        await editClass(classId, classData);
        toast({
          title: "Class updated successfully",
          variant: "default",
        });
      }

      onClose();
    } catch (error) {
      console.error("Error submitting class:", error);
      toast({
        title: "An error occurred",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!classId) return;
    
    setIsSubmitting(true);
    try {
      await cancelClass(classId);
      toast({
        title: "Class cancelled successfully",
        variant: "default",
      });
      onClose();
    } catch (error) {
      console.error("Error cancelling class:", error);
      toast({
        title: "An error occurred",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'schedule' ? 'Schedule a Class' : mode === 'edit' ? 'Edit Class' : 'View Class'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="gap-4 grid py-4">
            {isLoading ? (
              <div className="flex justify-center items-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={teacher?.avatar_url} alt={teacher?.name} />
                    <AvatarFallback>{teacher?.name?.charAt(0) || 'T'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{teacher?.name || 'Teacher'}</h3>
                    <p className="text-muted-foreground text-sm">Portuguese Teacher</p>
                  </div>
                </div>

                <div className="gap-2 grid">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Select Date and Time</span>
                  </div>
                  <DatePickerTimeExample
                    value={selectedDate}
                    setValue={setSelectedDate}
                    disabled={mode === 'view'}
                  />
                </div>

                <div className="gap-2 grid">
                  <div className="flex items-center gap-2">
                    <VideoIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Class Details</span>
                  </div>
                  <Textarea
                    placeholder="Add notes or questions for your teacher..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={mode === 'view'}
                    className="resize-none"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="sm:justify-between">
            {mode === 'edit' && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Cancel Class'
                )}
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {mode === 'view' ? 'Close' : 'Cancel'}
              </Button>
              {mode !== 'view' && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircleIcon className="mr-2 w-4 h-4" />
                  )}
                  {mode === 'schedule' ? 'Schedule' : 'Update'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClassModal; 