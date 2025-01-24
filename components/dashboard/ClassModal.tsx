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
import { toast } from "react-hot-toast";
import useClassApi from '@/hooks/useClassApi';
import useTeacherApi from '@/hooks/useTeacherApi';
import { z } from 'zod';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'schedule';
  existingStartTime?: Date | undefined;
  classId?: string | undefined;
}

/**
 * Validation schema for class data
 */
const classDataSchema = z.object({
  start_time: z.string().nonempty(),
  end_time: z.string().nonempty(),
  teacher_id: z.string().nonempty(),
  notes: z.string().optional(),
  title: z.string().nonempty(),
});

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
  const [isLoading, setIsLoading] = useState(false);
  const { scheduleClass, editClass, cancelClass } = useClassApi();
  const { getTeachers } = useTeacherApi();
  const [teacher, setTeacher] = useState(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchTeacher = async () => {
      const teacher = await getTeachers();
      setTeacher(teacher);
    }

    fetchTeacher();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const classData = {
        start_time: startTime ? startTime.toISOString() : "",
        end_time: startTime ? new Date(startTime.getTime() + 60 * 60 * 1000).toISOString() : "",
        teacher_id: teacher?.[0]?.id || "",
        notes: DOMPurify.sanitize(notes) || "",
        title: `Private Class with ${teacher?.[0]?.first_name} ${teacher?.[0]?.last_name}` || "",
      };

      // Validate class data
      classDataSchema.parse(classData);

      let response;

      if (mode === 'schedule') {
        response = await scheduleClass(classData);
      } else {
        response = await editClass(classId, classData);
      }

      if (response) {
        if (response.status === 200) {
          toast.success(response.message);
          onClose();
        } else {
          toast.error(response.message || "Failed to schedule class.");
        }
      }
    } catch (error) {
      console.error("Error processing class:", error);
      toast.error("An error occurred while scheduling the class.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelClass(classId);
      onClose();
      toast.success("Class canceled successfully");
    } catch (error) {
      console.error("Error canceling class:", error);
      toast.error("An error occurred while canceling the class.");
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-description="class-modal">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <DialogHeader className="flex flex-row items-center gap-2">
            <Avatar>
              <AvatarImage src={teacher?.[0]?.avatar_url} />
              <AvatarFallback>{teacher?.[0]?.first_name?.[0]} {teacher?.[0]?.last_name?.[0]}</AvatarFallback>
            </Avatar>
            <DialogTitle>{teacher?.[0]?.first_name} {teacher?.[0]?.last_name}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <p className="text-sm">Requires confirmation</p>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-green-500" />
              <p className="text-sm">1 hr</p>
            </div>
            <div className="flex items-center gap-2">
              <VideoIcon className="w-4 h-4 text-green-500" />
              <p className="text-sm">Google Meet</p>
            </div>
          </div>
          <DatePickerTimeExample value={startTime || existingStartTime} setValue={(date) => setStartTime(date ? new Date(date) : null)} />
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Send suggestions for the class here"
          />
          <DialogFooter>
            {mode === 'edit' && (
              <Button type="button" variant="destructive" onClick={handleCancel}>Cancel Class</Button>
            )}
            {mode === 'edit' && (
              <Button type="button" variant="outline" onClick={onClose}>Abandon Changes</Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {mode === 'schedule' ? "Schedule Class" : "Save Changes"}
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClassModal; 