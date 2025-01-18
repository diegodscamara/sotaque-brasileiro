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
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelType, setCancelType] = useState<'single' | 'all'>('single');


  useEffect(() => {
    fetchClasses({});
  }, [fetchClasses]);

  const handleCancel = async (class_: Class) => {
    setSelectedClass(class_);
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

  const handleEdit = (class_: Class) => {
    setSelectedClass(class_);
    setIsClassModalOpen(true);
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
    </>
  );
};

export default ClassList;
