"use client";

import { useEffect, useState, useCallback } from "react";

import { CalendarBlank } from "@phosphor-icons/react";
import { Class } from "@/types/class";
import { ClassListTable } from "./class-list-table";
import { ClassModal } from "./ClassModal";
import { fetchClasses, cancelClass as cancelClassAction } from "@/app/actions/classes";
import { useToast } from "@/hooks/use-toast"
import { z } from "zod";

const classSchema = z.object({
  id: z.string().nonempty(),
  start_time: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
});

const ClassList = () => {
  const { toast } = useToast()
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | undefined>(undefined);

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchClasses({});
      
      // Map the returned data to match the Class type structure
      const formattedClasses = result.data.map(classData => ({
        id: classData.id,
        title: classData.notes || `Class with ${classData.teacher.user.firstName || ''} ${classData.teacher.user.lastName || ''}`,
        start_time: classData.startDateTime,
        end_time: classData.endDateTime,
        notes: classData.notes || '',
        time_zone: 'UTC', // Default timezone if not available
        status: classData.status.toLowerCase() as 'scheduled' | 'pending' | 'confirmed' | 'completed' | 'cancelled',
        recurring_group_id: classData.recurringGroupId || undefined,
        user_id: classData.studentId, // Assuming user_id refers to the student
        created_at: classData.createdAt,
        updated_at: classData.updatedAt,
        teacher_id: classData.teacherId,
        student_id: classData.studentId,
        // Add teacher information
        teacherName: `${classData.teacher.user.firstName || ''} ${classData.teacher.user.lastName || ''}`.trim() || 'Unknown Teacher'
      }));
      
      setClasses(formattedClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Failed to load classes",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleCancel = async (class_: Class) => {
    setSelectedClass(class_);
    try {
      // Validate class input
      classSchema.parse(class_);
      await cancelClassAction(class_.id);
      toast({
        title: "Class canceled successfully",
        variant: "default",
      });
      loadClasses();
    } catch (error) {
      toast({
        title: "An error occurred while canceling the class.",
        variant: "destructive",
      });
      console.error("Cancel class error:", error); // Log error for analysis
    }
  };

  const handleEdit = (class_: Class) => {
    setSelectedClass(class_);
    setIsClassModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsClassModalOpen(false);
    setSelectedClass(undefined);
  };

  if (loading) {
    return <div>Loading...</div>; // Add a loading state
  }

  if (classes.length === 0) {
    return (
      <div className="py-12 text-center">
        <CalendarBlank className="mx-auto w-12 h-12 text-base-content/70" />
        <h3 className="mt-2 font-semibold text-sm">No classes scheduled</h3>
        <p className="mt-1 text-sm text-base-content/70">
          Get started by scheduling your first class.
        </p>
      </div>
    );
  }

  return (
    <>
      <ClassListTable classes={classes} handleCancel={handleCancel} handleEdit={handleEdit} />

      <ClassModal
        isOpen={isClassModalOpen}
        onClose={handleCloseModal}
        existingStartTime={selectedClass ? new Date(selectedClass.start_time) : undefined}
        classId={selectedClass?.id}
        mode={'edit'}
      />
    </>
  );
};

export default ClassList;
