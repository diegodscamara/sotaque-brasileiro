import { useState } from "react";

interface RecurringEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (editType: 'single' | 'all') => void;
  isSubmitting: boolean;
}

const RecurringEditDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting 
}: RecurringEditDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="z-[60] fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-base-100 p-6 rounded-lg w-full max-w-sm">
        <h3 className="mb-4 font-medium text-lg">Edit Recurring Class</h3>
        <p className="mb-6 text-base-content/70">
          Would you like to edit this class only, or all classes in the series?
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="btn btn-ghost"
            onClick={onClose}
          >
            {isSubmitting && <span className="loading loading-spinner loading-xs" />}
            Cancel
          </button>
          <button
            className="btn btn-outline btn-primary"
            onClick={() => onSubmit('single')}
          >
            {isSubmitting && <span className="loading loading-spinner loading-xs" />}
            This class
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onSubmit('all')}
          >
            {isSubmitting && <span className="loading loading-spinner loading-xs" />}
            All classes
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecurringEditDialog; 