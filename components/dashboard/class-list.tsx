"use client";

import { useEffect, useState } from "react";

import { CalendarBlank } from "@phosphor-icons/react";
import { Class } from "@/types/class";
import { ClassListTable } from "./class-list-table";
import { ClassModal } from "./ClassModal";
import { toast } from "react-hot-toast";
import useClassApi from "@/hooks/useClassApi";

const ClassList = () => {
  const { classes, loading, fetchClasses, cancelClass } = useClassApi();
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | undefined>(undefined);
  console.log(selectedClass)

  useEffect(() => {
    fetchClasses({});
  }, [fetchClasses]);

  const handleCancel = async (class_: Class) => {
    setSelectedClass(class_);
    // Add any additional logic for canceling a class if needed
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
        <p className="mt-1 text-base-content/70 text-sm">
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
        existingStartTime={selectedClass?.start_time}
        classId={selectedClass?.id}
        mode={'edit'}
      />
    </>
  );
};

export default ClassList;
