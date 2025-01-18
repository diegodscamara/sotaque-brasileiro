"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import { Class } from "@/types/class";
import { DateTimePicker24h } from "./DateTimePicker24h";
import React from "react";
import { Textarea } from "../ui/textarea";
import { toast } from "react-hot-toast";
import useClassApi from '@/hooks/useClassApi';
import useTeacherApi from '@/hooks/useTeacherApi';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  selectedClass?: Class;
  onClassUpdated: () => void;
  mode: 'view' | 'edit' | 'schedule'; // New prop to determine the mode
}

export const ClassModal = ({
  isOpen,
  onClose,
  selectedDate,
  selectedClass,
  onClassUpdated,
  mode, // New prop
}: ClassModalProps) => {
  const { scheduleClass, cancelClass } = useClassApi();
  const { getTeacher, getTeachers } = useTeacherApi();
  const [formData, setFormData] = useState({
    title: "",
    start_time: "",
    notes: "",
    teacher_id: "",
  });
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTeacherName = async (teacherId: string) => {
      const name = await getTeacher(teacherId);
      return name;
    };

    const initializeFormData = async () => {
      if (selectedClass) {
        const teacherName = await fetchTeacherName(selectedClass.teacher_id);
        setFormData({
          title: `Private class with ${teacherName}`,
          start_time: new Date(selectedClass.start_time).toISOString(),
          notes: selectedClass.notes || "",
          teacher_id: selectedClass.teacher_id,
        });
        setSelectedTeacher(selectedClass.teacher_id);
      } else {
        // Reset form data for scheduling a new class
        setFormData({
          title: "",
          start_time: new Date(selectedDate).toISOString(),
          notes: "",
          teacher_id: selectedTeacher,
        });
      }
    };

    initializeFormData();
  }, [selectedClass, selectedDate, selectedTeacher]);

  useEffect(() => {
    const fetchTeachers = async () => {
      const response = await getTeachers();
      setTeachers(response);
    };

    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true); // Set loading state
    try {
      if (!selectedTeacher) {
        toast.error("Please select a teacher before scheduling the class.");
        return; // Prevent submission if no teacher is selected
      }

      // Prepare the data to be sent to the API
      const startTime = new Date(formData.start_time);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Calculate end time (1 hour later)

      const classData = {
        ...formData,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        teacher_id: selectedTeacher,
      };

      const response = await scheduleClass(classData);
      if (response) {
        if (response.status === 200) {
          toast.success(response.message); // Show success message
          onClassUpdated(); // Refresh the class list
          onClose(); // Close the modal
        } else {
          toast.error(response.message || "Failed to schedule class."); // Show error message
        }
      }
    } catch (error) {
      console.error("Error processing class:", error);
      toast.error("An error occurred while scheduling the class.");
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  const handleCancel = async () => {
    if (selectedClass) {
      try {
        const response = await cancelClass(selectedClass.id);
        if (response) {
          if (response.status === 200) {
            toast.success(response.message); // Show success message
            onClassUpdated(); // Refresh the class list
            onClose(); // Close the modal
          } else {
            toast.error(response.message || "Failed to cancel class."); // Show error message
          }
        }
      } catch (error) {
        console.error("Error cancelling class:", error);
        toast.error("An error occurred while cancelling the class.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'view' ? "Class Details" : mode === 'edit' ? "Edit Class" : "Schedule Class"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="font-semibold text-lg">{formData.title}</p>
          <Select onValueChange={(value) => {
            const teacherId = value;
            setSelectedTeacher(teacherId);
            setFormData({ ...formData, teacher_id: teacherId });
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select a teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DateTimePicker24h formData={formData} setFormData={setFormData} />
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notes"
          />
          <DialogFooter>
            {mode === 'edit' && selectedClass && (
              <Button variant="destructive" onClick={handleCancel}>Cancel Class</Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {mode === 'schedule' ? "Schedule Class" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
};

export default ClassModal; 