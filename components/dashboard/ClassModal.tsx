"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import { Class } from "@/types/class";
import { Input } from "../ui/input";
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
  const { editClass, scheduleClass, cancelClass } = useClassApi();
  const { getTeacher, getTeachers } = useTeacherApi();
  const [formData, setFormData] = useState({
    title: "",
    start_time: "",
    end_time: "",
    notes: "",
    teacher_id: "",
  });
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);

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
          start_time: new Date(selectedClass.start_time).toISOString().slice(0, 16),
          end_time: new Date(selectedClass.end_time).toISOString().slice(0, 16),
          notes: selectedClass.notes || "",
          teacher_id: selectedClass.teacher_id,
        });
        setSelectedTeacher(selectedClass.teacher_id);
      } else {
        // Reset form data for scheduling a new class
        setFormData({
          title: "",
          start_time: new Date(selectedDate).toISOString().slice(0, 16),
          end_time: new Date(selectedDate).toISOString().slice(0, 16),
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
    try {
      if (!selectedTeacher) {
        toast.error("Please select a teacher before scheduling the class.");
        return; // Prevent submission if no teacher is selected
      }

      // Prepare the data to be sent to the API
      const classData = {
        ...formData,
        teacher_id: selectedTeacher,
      };

      const response = await scheduleClass(classData);
      if (response && response.status === 200) {
        toast.success("Class scheduled successfully");
        onClassUpdated(); // Refresh the class list
        onClose(); // Close the modal
      } 
    } catch (error) {
      console.error("Error processing class:", error);
      // No need to show toast here since it's already handled in useClassApi
    }
  };

  const handleCancel = async () => {
    if (selectedClass) {
      try {
        const response = await cancelClass(selectedClass.id);
        if (response && response.status === 200) {
          onClassUpdated(); // Refresh the class list
          onClose(); // Close the modal
          toast.success("Class cancelled successfully");
        } 
      } catch (error) {
        console.error("Error cancelling class:", error);
        // No need to show toast here since it's already handled in useClassApi
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
        <form onSubmit={handleSubmit}>
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
          <Input
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            required
          />
          <Input
            type="datetime-local"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            required
          />
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notes"
          />
          <Button variant="outline" type="submit">{mode === 'schedule' ? "Schedule Class" : "Save Changes"}</Button>
        </form>
        {mode === 'edit' && selectedClass && (
          <Button variant="destructive" onClick={handleCancel}>Cancel Class</Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClassModal; 