import { useState } from "react";

interface CancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cancelType: 'single' | 'all') => void;
  isSubmitting: boolean;
  isRecurring: boolean;
  isLastInSeries: boolean;
}

const CancelDialog = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  isRecurring,
  isLastInSeries
}: CancelDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="z-[60] fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-base-100 shadow-lg p-6 rounded-lg w-full max-w-lg">
        <h3 className="mb-4 font-medium text-lg">
          {isRecurring && !isLastInSeries ? "Cancel Recurring Class" : "Cancel Class"}
        </h3>
        <p className="mb-6 text-base-content/70">
          {isRecurring && !isLastInSeries
            ? "Would you like to cancel this class only, or all future classes in the series?"
            : "Are you sure you want to cancel this class?"
          }
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="btn btn-outline btn-primary btn-sm"
            onClick={onClose}
          >
            {isSubmitting && <span className="loading loading-spinner loading-xs" />}
            Keep Class{isRecurring && !isLastInSeries && 'es'}
          </button>
          <button
            className="btn btn-accent btn-sm"
            onClick={() => onSubmit('single')}
          >
            {isSubmitting && <span className="loading loading-spinner loading-xs" />}
            Cancel This Class
          </button>
          {isRecurring && !isLastInSeries && (
            <button
              className="btn btn-error btn-sm"
              onClick={() => onSubmit('all')}
            >
              {isSubmitting && <span className="loading loading-spinner loading-xs" />}
              Cancel All Future Classes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CancelDialog; 