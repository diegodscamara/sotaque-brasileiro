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
import { DatePickerTimeExample } from "./date-picker";
import React from "react";
import { Textarea } from "../ui/textarea";
import { toast } from "react-hot-toast";
import useClassApi from '@/hooks/useClassApi';
import useTeacherApi from '@/hooks/useTeacherApi';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'schedule';
  existingStartTime?: Date  | undefined;
  classId?: string | undefined;
}

export const ClassModal = ({
  isOpen,
  onClose,
  mode,
  existingStartTime,
  classId
}: ClassModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { scheduleClass, editClass } = useClassApi();
  const { getTeachers } = useTeacherApi();
  const [teacher, setTeacher] = useState(null);
  const [startTime, setStartTime] = useState<Date | null>(existingStartTime ? new Date(existingStartTime) : null);
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
        notes: notes || "",
        title: "Private Class with " + teacher?.[0]?.first_name + " " + teacher?.[0]?.last_name || "",
      };

      let response;

      if (mode === 'schedule') {
        response = await scheduleClass(classData);
      } else {
        response = await editClass(classId, classData);
      }

      if (response) {
        if (response.status === 200) {
          toast.success(response.message); // Show success message
          onClose(); // Close the modal
        } else {
          toast.error(response.message || "Failed to schedule class."); // Show error message
        }
      }
    } catch (error) {
      console.error("Error processing class:", error);
      toast.error("An error occurred while scheduling the class.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
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
          <DatePickerTimeExample value={startTime} setValue={(date) => setStartTime(date ? new Date(date) : null)} />
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Send suggestions for the class here"
          />
          <DialogFooter>
            {/* {mode === 'edit' && (
              <Button variant="destructive" onClick={handleCancel}>Cancel Class</Button>
            )} */}
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