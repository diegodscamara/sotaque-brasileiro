"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import { Class } from "@/types/class";
import { Input } from "../ui/input";
import React from "react";
import { Textarea } from "../ui/textarea";
import { toast } from "react-hot-toast";
import useClassApi from '@/hooks/useClassApi';

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
  const [formData, setFormData] = useState({
    title: "",
    start_time: "",
    end_time: "",
    notes: "",
  });

  useEffect(() => {
    if (selectedClass) {
      setFormData({
        title: selectedClass.title,
        start_time: new Date(selectedClass.start_time).toISOString(),
        end_time: new Date(selectedClass.end_time).toISOString(),
        notes: selectedClass.notes || "",
      });
    } else {
      // Reset form data for scheduling a new class
      setFormData({
        title: "",
        start_time: new Date(selectedDate).toISOString(),
        end_time: new Date(selectedDate).toISOString(),
        notes: "",
      });
    }
  }, [selectedClass, selectedDate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (mode === 'edit' && selectedClass) {
        await editClass(selectedClass.id, formData);
        toast.success("Class updated successfully");
      } else if (mode === 'schedule') {
        await scheduleClass(formData);
        toast.success("Class scheduled successfully");
      }
      onClassUpdated(); // Refresh the class list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error processing class:", error);
      toast.error("Failed to process class");
    }
  };

  const handleCancel = async () => {
    if (selectedClass) {
      try {
        await cancelClass(selectedClass.id);
        onClassUpdated(); // Refresh the class list
        onClose(); // Close the modal
        toast.success("Class cancelled successfully");
      } catch (error) {
        console.error("Error cancelling class:", error);
        toast.error("Failed to cancel class");
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
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Class Title"
            required
          />
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